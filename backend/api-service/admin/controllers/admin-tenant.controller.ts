import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  Res,
  BadRequestException,
} from "@nestjs/common";
import {
  PlatformAdminOnly,
  SuperAdminOnly,
} from "@shared/decorators/require-role.decorator";
import { AdminTenantService } from "../services/admin-tenant.service";
import { AuthService } from "@api/auth/auth.service";
import {
  PlanType,
  SubscriptionStatus,
} from "@shared/database/entities/billing/subscription.entity";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { TenantRole } from "@shared/database/entities/core/tenant-membership.entity";

class UpdateTenantPlanDto {
  @IsEnum(PlanType)
  plan: PlanType;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}

class UpdateTenantStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

class CreateTenantUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(TenantRole)
  role?: TenantRole;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  apiAccessEnabled?: boolean;

  @IsOptional()
  @IsString()
  password?: string;
}

class UpdateTenantUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(TenantRole)
  role?: TenantRole;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  apiAccessEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class OnboardResellerDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @Type(() => Number)
  initialCredits?: number;

  @IsOptional()
  @Type(() => Number)
  maxUsers?: number;

  @IsOptional()
  @Type(() => Number)
  monthlyMessageLimit?: number;
}

class UpdateResellerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @Type(() => Number)
  maxUsers?: number;

  @IsOptional()
  @Type(() => Number)
  monthlyMessageLimit?: number;

  @IsOptional()
  @Type(() => Number)
  aiCredits?: number;

  @IsOptional()
  @IsEnum(["active", "suspended"])
  status?: string;

  @IsOptional()
  @IsString()
  brandName?: string;

  @IsOptional()
  @IsString()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  domain?: string;
}

@Controller("admin/tenants")
@PlatformAdminOnly()
export class AdminTenantController {
  constructor(
    private readonly tenantService: AdminTenantService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getAllTenants(
    @Query("type") type?: string,
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    return this.tenantService.getAllTenants({
      type,
      status,
      search,
      page,
      limit,
    });
  }

  @Get(":id")
  async getTenantDetails(@Param("id") id: string) {
    // For resellers, we might use a specialized service call, but standard tenant view is fine
    return this.tenantService.getResellerDetails(id);
  }

  @Post(":id/impersonate")
  @SuperAdminOnly()
  async impersonateTenant(
    @Param("id") id: string,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const adminUser = req.user;
    const targetUser = await this.tenantService.getTenantOwner(id);

    if (!targetUser) {
      throw new BadRequestException("Target tenant owner not found");
    }

    const { access_token, refresh_token } = await this.authService.login(
      targetUser,
      req,
      {
        impersonatedBy: adminUser.id,
        isImpersonation: true,
        tenantId: id,
      },
    );

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      domain: isProduction ? ".aimstore.in" : undefined,
      path: "/",
      maxAge: 1 * 60 * 60 * 1000,
    });
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      domain: isProduction ? ".aimstore.in" : undefined,
      path: "/",
      maxAge: 2 * 60 * 60 * 1000,
    });

    return {
      success: true,
      workspaceId: id,
      redirectUrl: `/dashboard/${id}`,
    };
  }

  @Patch(":id/plan")
  @SuperAdminOnly()
  async updateTenantPlan(
    @Param("id") id: string,
    @Body() dto: UpdateTenantPlanDto,
  ) {
    return this.tenantService.updateUserPlan(id, dto.plan, dto.status);
  }

  @Patch(":id/limits")
  @SuperAdminOnly()
  async updateTenantLimits(@Param("id") id: string, @Body() dto: any) {
    return this.tenantService.updateTenantLimits(id, dto);
  }

  @Patch(":id/status")
  @SuperAdminOnly()
  async updateTenantStatus(
    @Param("id") id: string,
    @Body() dto: UpdateTenantStatusDto,
  ) {
    return this.tenantService.updateTenantStatus(id, dto.status as any, dto.reason);
  }

  @Get(":id/users")
  async getTenantUsers(@Param("id") id: string) {
    return this.tenantService.getTenantUsers(id);
  }

  @Post(":id/users")
  @SuperAdminOnly()
  async createTenantUser(
    @Param("id") id: string,
    @Body() dto: CreateTenantUserDto,
  ) {
    return this.tenantService.createTenantUser(id, {
      ...dto,
      status: dto.status as any,
    });
  }

  @Patch(":tenantId/users/:userId")
  @SuperAdminOnly()
  async updateTenantUser(
    @Param("tenantId") tenantId: string,
    @Param("userId") userId: string,
    @Body() dto: UpdateTenantUserDto,
  ) {
    return this.tenantService.updateTenantUser(tenantId, userId, {
      ...dto,
      status: dto.status as any,
    });
  }

  @Post(":tenantId/users/:userId/impersonate")
  @SuperAdminOnly()
  async impersonateTenantUser(
    @Param("tenantId") tenantId: string,
    @Param("userId") userId: string,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const adminUser = req.user;
    const targetUser = await this.tenantService.getTenantScopedUser(
      tenantId,
      userId,
    );
    const { access_token, refresh_token } = await this.authService.login(
      targetUser,
      req,
      {
        impersonatedBy: adminUser.id,
        isImpersonation: true,
        tenantId,
      },
    );

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      domain: isProduction ? ".aimstore.in" : undefined,
      path: "/",
      maxAge: 1 * 60 * 60 * 1000,
    });
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      domain: isProduction ? ".aimstore.in" : undefined,
      path: "/",
      maxAge: 2 * 60 * 60 * 1000,
    });

    return {
      success: true,
      workspaceId: tenantId,
      redirectUrl: `/dashboard/${tenantId}`,
    };
  }

  @Post("resellers")
  @SuperAdminOnly()
  async onboardReseller(@Body() dto: OnboardResellerDto) {
    return this.tenantService.onboardReseller(dto);
  }

  @Patch("resellers/:id")
  @SuperAdminOnly()
  async updateReseller(
    @Param("id") id: string,
    @Body() dto: UpdateResellerDto,
  ) {
    return this.tenantService.updateReseller(id, dto);
  }

  @Post("resellers/:id/regenerate-password")
  @SuperAdminOnly()
  async regenerateResellerPassword(@Param("id") id: string) {
    return this.tenantService.regenerateResellerPassword(id);
  }

  @Post("resellers/:id/deploy")
  @SuperAdminOnly()
  async deployResellerInstance(@Param("id") id: string) {
    return this.tenantService.deployResellerInstance(id);
  }
}
