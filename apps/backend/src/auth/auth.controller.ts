
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
import { Repository } from 'typeorm';
import { UseGuards, Request as NestRequest } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { UserRole } from '../users/entities/user.entity';
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
    private usersService: UsersService,
    private tenantsService: TenantsService,
    @InjectRepository(TenantMembership)
    private membershipRepo: Repository<TenantMembership>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private auditService: AuditService,
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

      // Set HttpOnly Cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true, // Always true for production/staging (Cloudflare handles SSL)
      sameSite: 'lax',
      domain: '.aerostic.com',
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
      // Create tenant first
      const tenant = await this.tenantsService.create({
        name: registerDto.workspace,
        slug: registerDto.workspace.toLowerCase().replace(/ /g, '-'), // Basic slugification
      });

      // Create user
      const user = await this.usersService.create({
        email: registerDto.email,
        password: registerDto.password,
        name: registerDto.name,
        role: UserRole.USER,
      });

      // Find the OWNER role entity
      const ownerRole = await this.roleRepo.findOne({ where: { name: 'owner' } });

      // Create membership
      await this.membershipRepo.save(
        this.membershipRepo.create({
          userId: user.id,
          tenantId: tenant.id,
          roleId: ownerRole?.id, // Dynamic roleId
          role: TenantRole.OWNER, // Still keeping enum for legacy/migration
        }),
      );

      // Audit registration
      await this.auditService.logAction(
        user.id,
        user.name,
        'REGISTER',
        `Workspace: ${tenant.name}`,
        tenant.id,
        { email: user.email, workspace: registerDto.workspace },
        undefined,
        LogLevel.SUCCESS,
        LogCategory.USER,
        'AuthController'
      );

      // Return user data without password
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
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
