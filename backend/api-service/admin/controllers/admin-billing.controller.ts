import { Controller, Get, Post, Body, Param, UseGuards, Query, Delete } from "@nestjs/common";
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

  @Get("wallets")
  @SuperAdminOnly()
  async getWallets() {
    return this.billingService.getAllWallets();
  }

  @Get("pricing")
  @SuperAdminOnly()
  async getPricing(@Query("tenantId") tenantId?: string) {
    return this.billingService.getTemplatePricing(tenantId);
  }

  @Post("pricing")
  @SuperAdminOnly()
  async updatePricing(
    @Body() updates: Record<string, string>,
    @Query("tenantId") tenantId?: string
  ) {
    return this.billingService.updateTemplatePricing(updates, "admin", tenantId);
  }

  @Delete("pricing")
  @SuperAdminOnly()
  async resetPricing(@Query("tenantId") tenantId: string) {
    return this.billingService.resetTemplatePricing(tenantId);
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
