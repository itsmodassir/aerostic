import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import {
  PlatformAdminOnly,
  SuperAdminOnly,
} from "@shared/decorators/require-role.decorator";
import { AdminBillingService } from "../services/admin-billing.service";

@Controller("admin/billing")
@PlatformAdminOnly()
export class AdminBillingController {
  constructor(private readonly billingService: AdminBillingService) {}

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
}
