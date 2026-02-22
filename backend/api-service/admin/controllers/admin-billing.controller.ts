import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import {
  PlatformAdminOnly,
  SuperAdminOnly,
} from "@shared/decorators/require-role.decorator";
import { AdminBillingService } from "../services/admin-billing.service";

@Controller("admin/billing")
@PlatformAdminOnly()
export class AdminBillingController {
  constructor(private readonly billingService: AdminBillingService) { }

  @Get("stats")
  @SuperAdminOnly()
  async getBillingStats() {
    return this.billingService.getBillingStats();
  }

  @Get("api-keys")
  @SuperAdminOnly()
  async getApiKeys() {
    return this.billingService.getAllApiKeys();
  }

  @Get("webhooks")
  @SuperAdminOnly()
  async getWebhooks() {
    return this.billingService.getAllWebhooks();
  }

  @Get("pricing/:tenantId?")
  @SuperAdminOnly()
  async getPricing(@Param("tenantId") tenantId?: string) {
    const rate = await this.billingService.getTemplateRate(tenantId);
    return { templateRate: rate, tenantId: tenantId || "global" };
  }

  @Post("pricing/:tenantId?")
  @SuperAdminOnly()
  async setPricing(
    @Body("rate") rate: number,
    @Param("tenantId") tenantId?: string
  ) {
    await this.billingService.setTemplateRate(rate, tenantId);
    return { success: true, rate, tenantId: tenantId || "global" };
  }

  @Post("wallets/:tenantId/fund")
  @SuperAdminOnly()
  async addFunds(
    @Param("tenantId") targetTenantId: string,
    @Body("amount") amount: number,
    @Body("description") description?: string
  ) {
    // Current assumption: Super Admin sits in the "System" tenant or a master tenant.
    // For MVP, we will extract the exact admin user's tenant from request if needed,
    // but here we can just use a generic 'system' identifier for the debit side,
    // or call a dedicated system bypass in WalletService.
    const result = await this.billingService.transferAdminFunds(
      targetTenantId,
      amount,
      description
    );
    return result;
  }
}
