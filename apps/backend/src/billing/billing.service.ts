import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus, PlanType } from './entities/subscription.entity';
import { ApiKey } from './entities/api-key.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { RazorpayService } from './razorpay.service';
import * as crypto from 'crypto';

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);

    constructor(
        @InjectRepository(Subscription)
        private subscriptionRepo: Repository<Subscription>,
        @InjectRepository(ApiKey)
        private apiKeyRepo: Repository<ApiKey>,
        @InjectRepository(WebhookEndpoint)
        private webhookRepo: Repository<WebhookEndpoint>,
        private razorpayService: RazorpayService,
    ) { }

    // ============ SUBSCRIPTIONS ============

    async getSubscription(tenantId: string): Promise<Subscription | null> {
        return this.subscriptionRepo.findOne({ where: { tenantId } });
    }

    async createTrialSubscription(tenantId: string): Promise<Subscription> {
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14-day trial

        const subscription = this.subscriptionRepo.create({
            tenantId,
            plan: PlanType.STARTER,
            status: SubscriptionStatus.TRIAL,
            trialEndsAt,
            monthlyMessages: 1000,
            aiCredits: 100,
            maxAgents: 1,
        });

        return this.subscriptionRepo.save(subscription);
    }

    async activateSubscription(
        tenantId: string,
        razorpaySubscriptionId: string,
        planId: string,
    ): Promise<Subscription> {
        let subscription = await this.getSubscription(tenantId);

        if (!subscription) {
            subscription = this.subscriptionRepo.create({ tenantId });
        }

        const plan = this.razorpayService.getPlanById(planId);

        // Map razorpay plan IDs to PlanType
        const planMapping: Record<string, PlanType> = {
            'plan_starter': PlanType.STARTER,
            'plan_growth': PlanType.GROWTH,
            'plan_enterprise': PlanType.ENTERPRISE,
        };
        const planType = planMapping[planId] || PlanType.STARTER;
        const planLimits = this.getPlanLimits(planType);

        subscription.razorpaySubscriptionId = razorpaySubscriptionId;
        subscription.status = SubscriptionStatus.ACTIVE;
        subscription.plan = planType;
        subscription.priceInr = plan?.priceInr || 1999;
        subscription.monthlyMessages = planLimits.monthlyMessages;
        subscription.aiCredits = planLimits.aiCredits;
        subscription.maxAgents = planLimits.maxAgents;
        subscription.apiAccess = planLimits.apiAccess;
        subscription.currentPeriodStart = new Date();
        subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        return this.subscriptionRepo.save(subscription);
    }

    async manualUpdateSubscription(
        tenantId: string,
        plan: PlanType,
        status: SubscriptionStatus = SubscriptionStatus.ACTIVE,
    ): Promise<Subscription> {
        let subscription = await this.getSubscription(tenantId);

        if (!subscription) {
            subscription = this.subscriptionRepo.create({ tenantId });
        }

        const limits = this.getPlanLimits(plan);

        subscription.plan = plan;
        subscription.status = status;
        subscription.monthlyMessages = limits.monthlyMessages;
        subscription.aiCredits = limits.aiCredits;
        subscription.maxAgents = limits.maxAgents;
        subscription.apiAccess = limits.apiAccess;

        // Reset period if it was trial or inactive
        if (subscription.status !== SubscriptionStatus.ACTIVE) {
            subscription.currentPeriodStart = new Date();
            subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }

        return this.subscriptionRepo.save(subscription);
    }

    public getPlanLimits(plan: PlanType) {
        const limits = {
            [PlanType.STARTER]: {
                monthlyMessages: 10000,
                aiCredits: 1000,
                maxAgents: 1,
                apiAccess: false,
            },
            [PlanType.GROWTH]: {
                monthlyMessages: 50000,
                aiCredits: 5000,
                maxAgents: 5,
                apiAccess: true,
            },
            [PlanType.ENTERPRISE]: {
                monthlyMessages: 999999,
                aiCredits: 999999,
                maxAgents: 999,
                apiAccess: true,
            },
        };
        return limits[plan] || limits[PlanType.STARTER];
    }

    // ============ API KEYS ============

    async getApiKeys(tenantId: string): Promise<ApiKey[]> {
        return this.apiKeyRepo.find({ where: { tenantId } });
    }

    async createApiKey(tenantId: string, name: string, permissions: string[]): Promise<{ apiKey: ApiKey; rawKey: string }> {
        const rawKey = `ask_${crypto.randomBytes(32).toString('hex')}`;
        const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
        const keyPrefix = rawKey.substring(0, 12);

        const apiKey = this.apiKeyRepo.create({
            tenantId,
            name,
            keyPrefix,
            keyHash,
            permissions,
        });

        await this.apiKeyRepo.save(apiKey);

        // Return raw key only once - user must save it
        return { apiKey, rawKey };
    }

    async validateApiKey(rawKey: string): Promise<ApiKey | null> {
        const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
        const apiKey = await this.apiKeyRepo.findOne({ where: { keyHash, isActive: true } });

        if (apiKey) {
            apiKey.lastUsedAt = new Date();
            apiKey.requestsToday++;
            await this.apiKeyRepo.save(apiKey);
        }

        return apiKey;
    }

    async revokeApiKey(tenantId: string, keyId: string): Promise<void> {
        await this.apiKeyRepo.update({ id: keyId, tenantId }, { isActive: false });
    }

    // ============ WEBHOOKS ============

    async getWebhookEndpoints(tenantId: string): Promise<WebhookEndpoint[]> {
        return this.webhookRepo.find({ where: { tenantId } });
    }

    async createWebhookEndpoint(
        tenantId: string,
        url: string,
        events: string[],
        description?: string,
    ): Promise<WebhookEndpoint> {
        const secret = crypto.randomBytes(32).toString('hex');

        const webhook = this.webhookRepo.create({
            tenantId,
            url,
            events,
            description,
            secret,
        });

        return this.webhookRepo.save(webhook);
    }

    async triggerWebhooks(tenantId: string, event: string, payload: any): Promise<void> {
        const webhooks = await this.webhookRepo.find({
            where: { tenantId, isActive: true },
        });

        for (const webhook of webhooks) {
            if (webhook.events.includes(event) || webhook.events.includes('*')) {
                this.sendWebhook(webhook, event, payload);
            }
        }
    }

    private async sendWebhook(webhook: WebhookEndpoint, event: string, payload: any): Promise<void> {
        try {
            const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
            const signature = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');

            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                    'X-Webhook-Event': event,
                },
                body,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            webhook.lastTriggeredAt = new Date();
            webhook.failureCount = 0;
            await this.webhookRepo.save(webhook);
        } catch (error) {
            this.logger.error(`Webhook failed: ${webhook.url}`, error);
            webhook.failureCount++;
            webhook.lastFailureAt = new Date();
            webhook.lastFailureReason = error.message;
            await this.webhookRepo.save(webhook);
        }
    }
}
