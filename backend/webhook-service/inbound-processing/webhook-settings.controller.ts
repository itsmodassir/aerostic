import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { BillingService } from "@api/billing/billing.service";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { TenantGuard } from "@shared/guards/tenant.guard";
import { PlansService } from "@api/billing/plans.service";

@Controller("webhooks/settings")
@UseGuards(JwtAuthGuard, TenantGuard)
export class WebhookSettingsController {
  constructor(
    private readonly billingService: BillingService,
    private readonly plansService: PlansService,
  ) {}

  @Get()
  async getSettings(@Req() req: any) {
    // Check if plan allows webhooks
    await this.checkPermission(req.tenant.planId);

    const endpoints = await this.billingService.getWebhookEndpoints(
      req.tenant.id,
    );
    return endpoints; // Return array as expected by frontend
  }

  @Post()
  async updateSettings(
    @Req() req: any,
    @Body() body: { url: string; events: string[]; isActive: boolean },
  ) {
    // Check if plan allows webhooks
    await this.checkPermission(req.tenant.planId);

    const endpoints = await this.billingService.getWebhookEndpoints(
      req.tenant.id,
    );
    const endpoint = endpoints[0];

    if (endpoint) {
      // Update existing
      // We need a method in service to update. BillingService currently only has create.
      // We can create a update method or just use repo if we were in service.
      // Let's assume we can update via a new service method.
      // For now, I'll create `updateWebhookEndpoint` in BillingService.
      return this.billingService.updateWebhookEndpoint(endpoint.id, body);
    } else {
      // Create new
      return this.billingService.createWebhookEndpoint(
        req.tenant.id,
        body.url,
        body.events,
        "User configured webhook",
      );
    }
  }

  private async checkPermission(planId: string) {
    if (!planId) return; // Legacy plans might not have restrictions or default to starter
    // Fetch plan and check features
    const plan = await this.plansService.findOne(planId);
    if (!plan.features.includes("webhooks")) {
      throw new ForbiddenException(
        "Webhooks feature is not available in your plan",
      );
    }
  }
}
