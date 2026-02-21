import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import { RazorpayWebhookGuard } from "../guards/razorpay-webhook.guard";
import { BillingService } from "../billing.service";

@Controller("billing/webhooks")
export class BillingWebhookController {
  constructor(private billingService: BillingService) {}

  @Post("razorpay")
  @UseGuards(RazorpayWebhookGuard)
  @HttpCode(200)
  async handleRazorpayWebhook(
    @Headers("x-razorpay-signature") signature: string,
    @Body() body: any,
  ) {
    const eventId =
      body.payload?.payment?.entity?.id ||
      body.payload?.subscription?.entity?.id ||
      `evt_${Date.now()}`;
    // Razorpay doesn't send a unique event ID in the top level object for all events,
    // but the entity ID + event name combo is a reasonable proxy or check x-razorpay-event-id header if available.
    // Actually, strict idempotency is best handled by `body.payload.payment.entity.id` etc.

    // Better: use the event ID if provided in headers or body. Razorpay sends `x-razorpay-event-id` header?
    // Documentation says check `x-razorpay-event-id` header. Let's try that or fallback to body hash.

    // For now, passing the whole body to service which handles logic
    return this.billingService.handleWebhookEvent(body);
  }
}
