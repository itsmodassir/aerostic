import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  BadRequestException,
  Res,
  UseGuards,
  Request as NestRequest,
  HttpStatus,
  Query,
  Patch,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { AuditService, LogLevel, LogCategory } from "../audit/audit.service";
import { AuditLog } from "@shared/database/entities/core/audit-log.entity";
import { MailService } from "@shared/mail.service";
import { IsNotEmpty, IsEmail, Matches, MinLength } from "class-validator";
import {
  TenantMembership,
  TenantRole,
} from "@shared/database/entities/core/tenant-membership.entity";
import { Role } from "@shared/database/entities/core/role.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { TenantGuard } from "@shared/guards/tenant.guard";
import { User, UserRole } from "@shared/database/entities/core/user.entity";
import { Tenant, TenantType } from "@shared/database/entities/core/tenant.entity";
import * as bcrypt from "bcrypt";
import { Throttle } from "@nestjs/throttler";
import { Domain } from "@shared/database/entities/core/domain.entity";
import { ResellerConfig } from "@shared/database/entities/core/reseller-config.entity";

class LoginDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

class VerifyLoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;
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

  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message:
      "Phone number must be in valid international format (e.g., +919999999999)",
  })
  phone: string;

  otp?: string; // Optional for initiation, required for finalization
}

class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

class ResetPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;

  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    @InjectRepository(TenantMembership)
    private membershipRepo: Repository<TenantMembership>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Domain)
    private domainRepo: Repository<Domain>,
    @InjectRepository(ResellerConfig)
    private resellerConfigRepo: Repository<ResellerConfig>,
    private auditService: AuditService,
    private dataSource: DataSource,
    private mailService: MailService,
  ) { }

  @Post("register/initiate")
  async initiateRegister(@Body() registerDto: RegisterDto) {
    this.logger.log(`Initiating registration for: ${registerDto.email}`);
    this.logger.debug(`Register DTO: ${JSON.stringify(registerDto)}`);
    // 1. Check if user already exists
    const existingUser = await this.usersService.findOneByEmail(
      registerDto.email,
    );
    if (existingUser) {
      this.logger.warn(`Email already registered: ${registerDto.email}`);
      throw new BadRequestException("Email already registered");
    }

    // 2. Generate and send OTP
    const otp = await this.authService.generateOtp(registerDto.email);
    await this.mailService.sendOtpEmail(registerDto.email, otp);

    return { success: true, message: "Verification code sent to email" };
  }

  @Post("login")
  @Throttle({ auth: { limit: 5, ttl: 3600000 } })
  async login(
    @Body() loginDto: LoginDto,
    @NestRequest() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      this.logger.log(`Login attempt for: ${loginDto.email}`);
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );
      if (!user) {
        this.logger.warn(`Invalid credentials for: ${loginDto.email}`);
        throw new UnauthorizedException("Invalid email or password");
      }

      this.logger.log(`User validated: ${user.id} (${user.role})`);
      const { access_token, refresh_token } = await this.authService.login(
        user,
        req,
      );

      const isProduction = process.env.NODE_ENV === "production";

      this.logger.debug("Setting cookies...");
      res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        domain: isProduction ? `.${process.env.BASE_DOMAIN || "aimstore.in"}` : undefined,
        path: "/",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        domain: isProduction ? `.${process.env.BASE_DOMAIN || "aimstore.in"}` : undefined,
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      this.logger.debug("Auditing login...");
      try {
        await this.auditService.logAction(
          user.id,
          user.name,
          "LOGIN",
          "User Session",
          undefined,
          { email: user.email },
          undefined,
          LogLevel.INFO,
          LogCategory.SECURITY,
          "AuthController",
        );
      } catch (auditError) {
        this.logger.error("Audit log failed (non-critical):", auditError.stack);
      }

      this.logger.debug("Fetching membership...");
      const membership = await this.membershipRepo.findOne({
        where: { userId: user.id },
        relations: ["tenant"],
      });

      this.logger.log(`Membership found: ${membership?.tenantId}`);
      return {
        user,
        workspaceId: membership?.tenantId,
        workspaceName: membership?.tenant?.name,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn(`Failed login attempt for ${loginDto.email}: ${error.message}`);
        throw error;
      }
      this.logger.error("Login CRASH:", error.stack);
      throw new Error("Internal server error during login");
    }
  }

  @Post("refresh")
  async refresh(
    @NestRequest() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    const sessionId = req.body.sessionId || req.headers["x-session-id"]; // Strategy: Access token contains sessionId

    // Note: Since access token is expired, we need to extract sessionId from it without validation (expired is OK)
    // or just let the client pass it. Better: Extract from cookie/header if possible.
    // For now, let's assume the body/header for simplicity in this flow.
    const { access_token, refresh_token: newRefreshToken } =
      await this.authService.refreshTokens(refreshToken, sessionId, req);

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      domain: isProduction ? ".aimstore.in" : undefined,
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      domain: isProduction ? ".aimstore.in" : undefined,
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { success: true };
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(
    @NestRequest() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.user && req.user.sessionId) {
      // Revoke the specific device session
      await this.authService.logout(req.user.sessionId);
    }
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("access_token", {
      domain: isProduction ? ".aimstore.in" : undefined,
      path: "/",
    });
    res.clearCookie("refresh_token", {
      domain: isProduction ? ".aimstore.in" : undefined,
      path: "/",
    });

    return { success: true };
  }

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    if (!registerDto.otp) {
      throw new BadRequestException("Verification code is required");
    }

    const isValid = await this.authService.verifyOtp(
      registerDto.email,
      registerDto.otp,
    );
    if (!isValid) {
      throw new BadRequestException("Invalid or expired verification code");
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        // 1. Create Tenant
        const slug = registerDto.workspace
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const tenantRepo = manager.getRepository(Tenant); // Use Entity class

        const tenant = tenantRepo.create({
          name: registerDto.workspace,
          slug: slug || `workspace-${Date.now()}`,
          plan: "free", // Default plan
          subscriptionStatus: "trialing",
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        await tenantRepo.save(tenant);

        // 2. Create User
        // Use the transaction manager to ensure atomicity
        const userRepo = manager.getRepository(User);
        const existingUser = await userRepo.findOne({
          where: { email: registerDto.email },
        });
        if (existingUser) {
          throw new BadRequestException("Email already registered");
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(registerDto.password, salt);

        const user = userRepo.create({
          email: registerDto.email,
          passwordHash,
          name: registerDto.name,
          phone: registerDto.phone,
          role: UserRole.USER,
          isActive: true,
          apiAccessEnabled: false,
        });
        await userRepo.save(user);

        // 3. Create Membership
        const roleRepo = manager.getRepository(Role);
        let ownerRole = await roleRepo.findOne({ where: { name: "owner" } });

        // Auto-create role if missing (safety net)
        if (!ownerRole) {
          ownerRole = roleRepo.create({ name: "owner" });
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

        // 4. Send Welcome Email (Non-blocking)
        this.mailService
          .sendWelcomeEmail(user.email, user.name)
          .catch((err) => {
            this.logger.error("Failed to send welcome email:", err.stack);
          });

        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error) {
      this.logger.error("Registration error details:", error.stack);
      if (
        error.message?.includes("already exists") ||
        error.message?.includes("duplicate key")
      ) {
        throw new BadRequestException("Email already registered");
      }
      throw error;
    }
  }

  @Get("branding")
  async getBranding(@Query("host") host?: string) {
    const fallback = {
      brandName: "Aerostic",
      logo: null,
      favicon: null,
      primaryColor: "#2563eb",
      supportEmail: "support@aimstore.in",
    };

    const normalizedHost = host?.toLowerCase().split(":")[0]?.trim();
    if (!normalizedHost) {
      return fallback;
    }

    const baseDomain = (process.env.BASE_DOMAIN || "aimstore.in").toLowerCase();
    const firstPartyHosts = new Set([
      baseDomain,
      `www.${baseDomain}`,
      `app.${baseDomain}`,
      `admin.${baseDomain}`,
      `api.${baseDomain}`,
    ]);

    if (
      firstPartyHosts.has(normalizedHost) ||
      normalizedHost === "localhost" ||
      normalizedHost.endsWith(".localhost")
    ) {
      return fallback;
    }

    let config = await this.resellerConfigRepo.findOne({
      where: { domain: normalizedHost },
    });

    if (!config) {
      const domain = await this.domainRepo.findOne({
        where: { hostname: normalizedHost },
        relations: ["tenant", "tenant.reseller"],
      });

      if (domain?.tenant) {
        const brandingTenantId =
          domain.tenant.type === TenantType.RESELLER
            ? domain.tenant.id
            : domain.tenant.resellerId;

        if (brandingTenantId) {
          config = await this.resellerConfigRepo.findOne({
            where: { tenantId: brandingTenantId },
          });
        }
      }
    }

    if (!config) {
      return fallback;
    }

    return {
      brandName: config.brandName || fallback.brandName,
      logo: config.logo || fallback.logo,
      favicon: config.favicon || fallback.favicon,
      primaryColor: config.primaryColor || fallback.primaryColor,
      supportEmail: config.supportEmail || fallback.supportEmail,
    };
  }

  @Post("password/forgot")
  @Throttle({ auth: { limit: 5, ttl: 3600000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const user = await this.usersService.findOneByEmail(dto.email);

    // Avoid account enumeration: always return success, only send OTP for known users.
    if (user) {
      const otp = await this.authService.generateOtp(dto.email);
      await this.mailService.sendOtpEmail(dto.email, otp);
    }

    return {
      success: true,
      message: "If an account exists, a reset code has been sent.",
    };
  }

  @Post("password/reset")
  @Throttle({ auth: { limit: 5, ttl: 3600000 } })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const isValidOtp = await this.authService.verifyOtp(dto.email, dto.otp);
    if (!isValidOtp) {
      throw new BadRequestException("Invalid or expired verification code");
    }

    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user) {
      throw new BadRequestException("Invalid reset request");
    }

    const salt = await bcrypt.genSalt();
    user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    await this.userRepo.save(user);
    await this.authService.revokeAllSessionsForUser(user.id);

    return { success: true, message: "Password reset successfully" };
  }

  @Get("membership")
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getMembership(
    @NestRequest() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.debug(`HEADERS: ${JSON.stringify(req.headers)}`);
    res.setHeader("Cache-Control", "no-store");
    const branding =
      req.membership?.tenant?.type === "reseller"
        ? req.membership?.tenant?.resellerConfig
        : req.membership?.tenant?.reseller?.resellerConfig;

    this.logger.log(
      `Returning membership for ${req.membership?.tenant?.slug} (Type: ${req.membership?.tenant?.type})`,
    );
    return {
      ...req.membership,
      tenantType: req.membership?.tenant?.type,
      branding,
      permissions: req.permissions, // Resolved in TenantGuard
    };
  }

  @Get("workspaces")
  @UseGuards(JwtAuthGuard)
  async getWorkspaces(@NestRequest() req: any) {
    const userId = req.user.id;
    return this.membershipRepo.find({
      where: { userId },
      relations: ["tenant"],
    });
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @NestRequest() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader("Cache-Control", "no-store");
    // Return the full user profile including global role
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    };
  }
}
