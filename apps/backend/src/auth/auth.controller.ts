
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
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );
      if (!user) {
        // Generic message prevents username enumeration
        throw new UnauthorizedException('Invalid email or password');
      }

      const { access_token } = await this.authService.login(user);

      const isProduction = process.env.NODE_ENV === 'production';

      // Set HttpOnly Cookie
      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: isProduction, // False for localhost
        sameSite: 'lax',
        domain: isProduction ? '.aerostic.com' : undefined, // Undefined for localhost
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Audit login
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

      // Get user's primary workspace (first membership)
      const membership = await this.membershipRepo.findOne({
        where: { userId: user.id },
        relations: ['tenant'],
      });

      return {
        user,
        workspaceId: membership?.tenantId,
        workspaceName: membership?.tenant?.name,
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error('Internal server error during login');
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      domain: '.aerostic.com',
      path: '/',
    });
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
  async getMembership(@NestRequest() req: any) {
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
  async getProfile(@NestRequest() req: any) {
    // Return the full user profile including global role
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      globalRole: req.user.role,
    };
  }
}
