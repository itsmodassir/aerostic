
import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { AuditService } from '../audit/audit.service';
import { LogCategory, LogLevel } from '../audit/entities/audit-log.entity';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { TenantMembership, TenantRole } from '../tenants/entities/tenant-membership.entity';
import { Role } from '../tenants/entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UseGuards, Request as NestRequest } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import * as bcrypt from 'bcrypt';
import { Throttle } from '@nestjs/throttler';

class LoginDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  workspace: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectRepository(TenantMembership)
    private membershipRepo: Repository<TenantMembership>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) { }

  @Post('login')
  @Throttle({ auth: { limit: 5, ttl: 3600000 } })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      console.log(`[AuthController] Login attempt for: ${loginDto.email}`);
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );
      if (!user) {
        console.warn(`[AuthController] Invalid credentials for: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      console.log(`[AuthController] User validated: ${user.id} (${user.role})`);
      const { access_token } = await this.authService.login(user);

      const isProduction = process.env.NODE_ENV === 'production';

      console.log('[AuthController] Setting cookie...');
      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: isProduction, // False for localhost
        sameSite: 'lax',
        domain: isProduction ? '.aerostic.com' : undefined, // Undefined for localhost
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      console.log('[AuthController] Auditing login...');
      try {
        await this.auditService.logAction(
          user.id,
          user.name,
          'LOGIN',
          'User Session',
          undefined,
          { email: user.email },
          undefined,
          LogLevel.INFO,
          LogCategory.SECURITY,
          'AuthController'
        );
      } catch (auditError) {
        console.error('[AuthController] Audit log failed (non-critical):', auditError);
      }

      console.log('[AuthController] Fetching membership...');
      const membership = await this.membershipRepo.findOne({
        where: { userId: user.id },
        relations: ['tenant'],
      });

      console.log(`[AuthController] Membership found: ${membership?.tenantId}`);
      return {
        user,
        workspaceId: membership?.tenantId,
        workspaceName: membership?.tenant?.name,
      };
    } catch (error) {
      console.error('[AuthController] Login CRASH:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error('Internal server error during login');
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@NestRequest() req: any, @Res({ passthrough: true }) res: Response) {
    if (req.user && req.user.id) {
      await this.authService.logout(req.user.id);
    }
    const isProduction = process.env.NODE_ENV === 'production';

    // 1. Clear root domain cookie (Wildcard)
    res.clearCookie('access_token', {
      domain: isProduction ? '.aerostic.com' : undefined,
      path: '/',
    });

    if (isProduction) {
      // 2. Clear app subdomain specific cookie (Potential Zombie)
      res.clearCookie('access_token', {
        domain: 'app.aerostic.com',
        path: '/',
      });

      // 3. Clear HostOnly cookie (No domain attribute)
      res.clearCookie('access_token', {
        path: '/',
      });
    }

    return { success: true };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        // 1. Create Tenant
        const slug = registerDto.workspace.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const tenantRepo = manager.getRepository(Tenant); // Use Entity class

        const tenant = tenantRepo.create({
          name: registerDto.workspace,
          slug: slug || `workspace-${Date.now()}`,
          plan: 'free', // Default plan
          subscriptionStatus: 'trialing',
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        await tenantRepo.save(tenant);

        // 2. Create User
        // Use the transaction manager to ensure atomicity
        const userRepo = manager.getRepository(User);
        const existingUser = await userRepo.findOne({ where: { email: registerDto.email } });
        if (existingUser) {
          throw new BadRequestException('Email already registered');
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(registerDto.password, salt);

        const user = userRepo.create({
          email: registerDto.email,
          passwordHash,
          name: registerDto.name,
          role: UserRole.USER,
          isActive: true,
          apiAccessEnabled: false,
        });
        await userRepo.save(user);

        // 3. Create Membership
        const roleRepo = manager.getRepository(Role);
        let ownerRole = await roleRepo.findOne({ where: { name: 'owner' } });

        // Auto-create role if missing (safety net)
        if (!ownerRole) {
          ownerRole = roleRepo.create({ name: 'owner' });
          await roleRepo.save(ownerRole);
        }

        const membershipRepo = manager.getRepository(TenantMembership);
        const membership = membershipRepo.create({
          userId: user.id,
          tenantId: tenant.id,
          roleId: ownerRole.id,
          role: TenantRole.OWNER,
        });
        await membershipRepo.save(membership);

        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error) {
      console.error('Registration error details:', error);
      if (
        error.message?.includes('already exists') ||
        error.message?.includes('duplicate key')
      ) {
        throw new BadRequestException('Email already registered');
      }
      throw error;
    }
  }

  @Get('membership')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getMembership(@NestRequest() req: any, @Res({ passthrough: true }) res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    return {
      ...req.membership,
      permissions: req.permissions, // Resolved in TenantGuard
    };
  }

  @Get('workspaces')
  @UseGuards(JwtAuthGuard)
  async getWorkspaces(@NestRequest() req: any) {
    const userId = req.user.id;
    return this.membershipRepo.find({
      where: { userId },
      relations: ['tenant'],
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@NestRequest() req: any, @Res({ passthrough: true }) res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    // Return the full user profile including global role
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      globalRole: req.user.role,
    };
  }
}
