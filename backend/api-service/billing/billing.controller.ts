import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  UnauthorizedException,
} from "@nestjs/common";
import { RazorpayService } from "./razorpay.service";
import { BillingService } from "./billing.service";
import { PlansService } from "./plans.service";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";

@UseGuards(JwtAuthGuard)
@Controller("billing")
export class BillingController {
  constructor(
    private razorpayService: RazorpayService,
    private billingService: BillingService,
    private plansService: PlansService,
  ) {}

  // ============ PLANS ============

  @Get("plans")
  getPlans() {
    return this.razorpayService.getPlans();
  }

  @Get("available-plans")
  getAvailablePlans() {
    return this.plansService.findAll();
  }

  // ============ SUBSCRIPTION ============

  @Get("subscription")
  async getSubscription(@UserTenant() tenantId: string) {
    if (!tenantId) throw new UnauthorizedException("Tenant ID required");
    return this.billingService.getSubscription(tenantId);
  }

  @Post("subscribe")
  async createSubscription(
    @UserTenant() tenantId: string,
    @Req() req: any,
    @Body() body: { planId: string },
  ) {
    if (!tenantId) throw new UnauthorizedException("Tenant ID required");
    const email = req.user?.email || "demo@example.com";
    const phone = req.user?.phone || "9999999999";

    // Map UUID to Razorpay Plan ID
    let razorpayPlanId = body.planId;
    if (body.planId.includes("-")) {
      // Assume UUID
      try {
        const plan = await this.plansService.findOne(body.planId);
        // Use stored Razorpay ID, fallback to slug-based ID
        razorpayPlanId = plan.razorpayPlanId || `plan_${plan.slug}`;
      } catch (e) {
        // Ignore, maybe it's already a razorpay id or fails
      }
    }

    return this.razorpayService.createSubscription({
      tenantId,
      planId: razorpayPlanId,
      email,
      phone,
    });
  }

  @Post("trial")
  async startTrial(@UserTenant() tenantId: string) {
    if (!tenantId) throw new UnauthorizedException("Tenant ID required");
    return this.billingService.createTrialSubscription(tenantId);
  }

  @Post("webhook")
  @HttpCode(200)
  async handleWebhook(@Req() req: any, @Body() body: any) {
    const signature = req.headers["x-razorpay-signature"];

    // Verify signature in production
    // if (!this.razorpayService.verifyWebhookSignature(JSON.stringify(body), signature)) {
    //   throw new UnauthorizedException('Invalid signature');
    // }

    const event = body.event;
    const payload = body.payload;

    switch (event) {
      case "subscription.activated":
        await this.billingService.activateSubscription(
          payload.subscription.entity.notes.tenant_id,
          payload.subscription.entity.id,
          payload.subscription.entity.plan_id,
        );
        break;
      case "subscription.cancelled":
      case "subscription.expired":
        // Handle cancellation
        break;
      case "payment.captured":
        // Handle successful payment
        break;
    }

    return { received: true };
  }

  // ============ API KEYS ============

  @Get("api-keys")
  async getApiKeys(@UserTenant() tenantId: string) {
    if (!tenantId) throw new UnauthorizedException("Tenant ID required");
    return this.billingService.getApiKeys(tenantId);
  }

  @Post("api-keys")
  async createApiKey(
    @UserTenant() tenantId: string,
    @Body() body: { name: string; permissions: string[] },
  ) {
    if (!tenantId) throw new UnauthorizedException("Tenant ID required");
    return this.billingService.createApiKey(
      tenantId,
      body.name,
      body.permissions,
    );
  }

  @Delete("api-keys/:id")
  async revokeApiKey(@UserTenant() tenantId: string, @Param("id") id: string) {
    if (!tenantId) throw new UnauthorizedException("Tenant ID required");
    await this.billingService.revokeApiKey(tenantId, id);
    return { success: true };
  }

  // ============ WEBHOOKS ============

  @Get("webhooks")
  async getWebhooks(@UserTenant() tenantId: string) {
    if (!tenantId) throw new UnauthorizedException("Tenant ID required");
    return this.billingService.getWebhookEndpoints(tenantId);
  }

  @Post("webhooks")
  async createWebhook(
    @UserTenant() tenantId: string,
    @Body() body: { url: string; events: string[]; description?: string },
  ) {
    if (!tenantId) throw new UnauthorizedException("Tenant ID required");
    return this.billingService.createWebhookEndpoint(
      tenantId,
      body.url,
      body.events,
      body.description,
    );
  }
  @Get("invoices")
  async getInvoiceHistory(@UserTenant() tenantId: string) {
    if (!tenantId) throw new UnauthorizedException("Tenant ID required");
    return this.billingService.getInvoices(tenantId);
  }

  @Get("usage")
  async getUsageMetrics(@UserTenant() tenantId: string) {
    if (!tenantId) throw new UnauthorizedException("Tenant ID required");
    return this.billingService.getUsageMetrics(tenantId);
  }
}
