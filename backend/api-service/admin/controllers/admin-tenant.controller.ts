import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import {
  PlatformAdminOnly,
  SuperAdminOnly,
} from "@shared/decorators/require-role.decorator";
import { AdminTenantService } from "../services/admin-tenant.service";
import {
  Subscription,
  PlanType,
  SubscriptionStatus,
} from "@shared/database/entities/billing/subscription.entity";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

class UpdateTenantPlanDto {
  @IsEnum(PlanType)
  plan: PlanType;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
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
  constructor(private readonly tenantService: AdminTenantService) {}

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
