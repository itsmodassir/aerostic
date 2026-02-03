import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards, HttpCode } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
    constructor(
        private razorpayService: RazorpayService,
        private billingService: BillingService,
    ) { }

    // ============ PLANS ============

    @Get('plans')
    getPlans() {
        return this.razorpayService.getPlans();
    }

    // ============ SUBSCRIPTION ============

    @Get('subscription')
    async getSubscription(@Req() req: any) {
        const tenantId = req.user?.tenantId || 'demo-tenant';
        return this.billingService.getSubscription(tenantId);
    }

    @Post('subscribe')
    async createSubscription(@Req() req: any, @Body() body: { planId: string }) {
        const tenantId = req.user?.tenantId || 'demo-tenant';
        const email = req.user?.email || 'demo@example.com';
        const phone = req.user?.phone || '9999999999';

        return this.razorpayService.createSubscription({
            tenantId,
            planId: body.planId,
            email,
            phone,
        });
    }

    @Post('webhook')
    @HttpCode(200)
    async handleWebhook(@Req() req: any, @Body() body: any) {
        const signature = req.headers['x-razorpay-signature'];

        // Verify signature in production
        // if (!this.razorpayService.verifyWebhookSignature(JSON.stringify(body), signature)) {
        //   throw new UnauthorizedException('Invalid signature');
        // }

        const event = body.event;
        const payload = body.payload;

        switch (event) {
            case 'subscription.activated':
                await this.billingService.activateSubscription(
                    payload.subscription.entity.notes.tenant_id,
                    payload.subscription.entity.id,
                    payload.subscription.entity.plan_id,
                );
                break;
            case 'subscription.cancelled':
            case 'subscription.expired':
                // Handle cancellation
                break;
            case 'payment.captured':
                // Handle successful payment
                break;
        }

        return { received: true };
    }

    // ============ API KEYS ============

    @Get('api-keys')
    async getApiKeys(@Req() req: any) {
        const tenantId = req.user?.tenantId || 'demo-tenant';
        return this.billingService.getApiKeys(tenantId);
    }

    @Post('api-keys')
    async createApiKey(@Req() req: any, @Body() body: { name: string; permissions: string[] }) {
        const tenantId = req.user?.tenantId || 'demo-tenant';
        return this.billingService.createApiKey(tenantId, body.name, body.permissions);
    }

    @Delete('api-keys/:id')
    async revokeApiKey(@Req() req: any, @Param('id') id: string) {
        const tenantId = req.user?.tenantId || 'demo-tenant';
        await this.billingService.revokeApiKey(tenantId, id);
        return { success: true };
    }

    // ============ WEBHOOKS ============

    @Get('webhooks')
    async getWebhooks(@Req() req: any) {
        const tenantId = req.user?.tenantId || 'demo-tenant';
        return this.billingService.getWebhookEndpoints(tenantId);
    }

    @Post('webhooks')
    async createWebhook(
        @Req() req: any,
        @Body() body: { url: string; events: string[]; description?: string },
    ) {
        const tenantId = req.user?.tenantId || 'demo-tenant';
        return this.billingService.createWebhookEndpoint(
            tenantId,
            body.url,
            body.events,
            body.description,
        );
    }
}
