import { Controller, Get, Post, Body, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { TenantGuard } from "@shared/guards/tenant.guard";
import { PermissionsGuard } from "@shared/guards/permissions.guard";
import { Permissions } from "@shared/decorators/permissions.decorator";
import { BillingService } from "../billing.service";
import { RazorpayService } from "../razorpay.service";

@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller("billing/subscription")
export class BillingSubscriptionController {
  constructor(
    private billingService: BillingService,
    private razorpayService: RazorpayService,
  ) {}

  @Get("plans")
  getPlans() {
    return this.razorpayService.getPlans();
  }

  @Get()
  @Permissions("billing:read")
  async getSubscription(@Req() req: any) {
    return this.billingService.getSubscription(req.tenant.id);
  }

  @Post("subscribe")
  @Permissions("billing:write")
  async createSubscription(@Req() req: any, @Body() body: { planId: string }) {
    return this.razorpayService.createSubscription({
      tenantId: req.tenant.id,
      planId: body.planId,
      email: req.user.email,
      phone: req.user.phone || "", // Check if phone is available
    });
  }
}
