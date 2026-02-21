import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { TenantGuard } from "@shared/guards/tenant.guard";
import { PermissionsGuard } from "@shared/guards/permissions.guard";
import { Permissions } from "@shared/decorators/permissions.decorator";
import { BillingService } from "../billing.service";

@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller("billing/api-keys")
export class BillingApiKeysController {
  constructor(private billingService: BillingService) {}

  @Get()
  @Permissions("settings:read")
  async getApiKeys(@Req() req: any) {
    return this.billingService.getApiKeys(req.tenant.id);
  }

  @Post()
  @Permissions("settings:write")
  async createApiKey(
    @Req() req: any,
    @Body() body: { name: string; permissions: string[] },
  ) {
    return this.billingService.createApiKey(
      req.tenant.id,
      body.name,
      body.permissions,
    );
  }

  @Delete(":id")
  @Permissions("settings:write")
  async revokeApiKey(@Req() req: any, @Param("id") id: string) {
    await this.billingService.revokeApiKey(req.tenant.id, id);
    return { success: true };
  }
}
