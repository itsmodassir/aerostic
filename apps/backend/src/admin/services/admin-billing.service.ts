
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../../billing/entities/api-key.entity';
import { Subscription, SubscriptionStatus } from '../../billing/entities/subscription.entity';
import { WebhookEndpoint } from '../../billing/entities/webhook-endpoint.entity';

@Injectable()
export class AdminBillingService {
    constructor(
        @InjectRepository(ApiKey)
        private apiKeyRepo: Repository<ApiKey>,
        @InjectRepository(Subscription)
        private subscriptionRepo: Repository<Subscription>,
        @InjectRepository(WebhookEndpoint)
        private webhookEndpointRepo: Repository<WebhookEndpoint>,
    ) { }

    async getAllApiKeys() {
        const keys = await this.apiKeyRepo.find({
            relations: ['tenant'],
            order: { createdAt: 'DESC' },
        });

        if (keys.length === 0) {
            return [
                {
                    id: '1',
                    name: 'Production API Key',
                    tenantName: 'TechStart India',
                    key: 'ak_live_xxxxxxxxxxxxxxxx',
                    status: 'active',
                    createdAt: new Date(),
                    lastUsed: new Date(),
                    requests: '1.2M',
                },
            ];
        }

        return keys.map((k) => ({
            id: k.id,
            name: k.name || 'API Key',
            tenantName: (k as any).tenant?.name || 'Unknown',
            key: `${k.keyPrefix}...`,
            status: k.isActive ? 'active' : 'revoked',
            createdAt: k.createdAt,
            lastUsed: k.lastUsedAt,
            requests: k.requestsToday?.toLocaleString() || '0',
        }));
    }

    async getAllWebhooks() {
        const webhooks = await this.webhookEndpointRepo.find({
            relations: ['tenant'],
            order: { createdAt: 'DESC' },
        });

        // Calculate aggregate stats
        const total = webhooks.length;
        const active = webhooks.filter((w) => w.isActive).length;
        const failing = webhooks.filter((w) => w.failureCount > 5).length;

        return {
            stats: { total, active, failing, deliveriesToday: '0' },
            webhooks: webhooks.map((w) => ({
                id: w.id,
                url: w.url,
                tenant: w.tenant?.name || 'Unknown',
                events: w.events,
                status: w.isActive
                    ? w.failureCount > 10
                        ? 'failing'
                        : 'active'
                    : 'inactive',
                lastDelivery: w.lastTriggeredAt,
                successRate: w.failureCount > 0 ? '95%' : '100%',
            })),
        };
    }

    async getBillingStats() {
        const activeSubscriptions = await this.subscriptionRepo.find({
            where: { status: SubscriptionStatus.ACTIVE },
            relations: ['tenant'],
        });

        const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
            return sum + sub.priceInr;
        }, 0);

        const avgRevenue =
            activeSubscriptions.length > 0
                ? totalRevenue / activeSubscriptions.length
                : 0;

        // Plan Distribution
        const distribution = {
            enterprise: { count: 0, revenue: 0 },
            growth: { count: 0, revenue: 0 },
            starter: { count: 0, revenue: 0 },
        };

        activeSubscriptions.forEach((sub) => {
            const plan = (sub.plan?.toLowerCase() ||
                'starter') as keyof typeof distribution;
            if (distribution[plan]) {
                distribution[plan].count++;
                distribution[plan].revenue += sub.priceInr;
            }
        });

        return {
            revenueStats: [
                {
                    label: 'Total Revenue',
                    value: `₹${(totalRevenue / 100000).toFixed(2)}L`,
                    change: '+10.5%',
                    period: 'vs last month',
                },
                {
                    label: 'Active Subscriptions',
                    value: activeSubscriptions.length.toLocaleString(),
                    change: '+5.2%',
                    period: 'vs last month',
                },
                {
                    label: 'Avg Revenue/User',
                    value: `₹${Math.round(avgRevenue).toLocaleString()}`,
                    change: '+2.1%',
                    period: 'vs last month',
                },
                {
                    label: 'Churn Rate',
                    value: '1.2%',
                    change: '-0.3%',
                    period: 'vs last month',
                },
            ],
            planDistribution: [
                {
                    plan: 'Enterprise',
                    count: distribution.enterprise.count,
                    revenue: `₹${(distribution.enterprise.revenue / 100000).toFixed(2)}L`,
                    percentage:
                        (distribution.enterprise.revenue / (totalRevenue || 1)) * 100,
                },
                {
                    plan: 'Growth',
                    count: distribution.growth.count,
                    revenue: `₹${(distribution.growth.revenue / 100000).toFixed(2)}L`,
                    percentage:
                        (distribution.growth.revenue / (totalRevenue || 1)) * 100,
                },
                {
                    plan: 'Starter',
                    count: distribution.starter.count,
                    revenue: `₹${(distribution.starter.revenue / 100000).toFixed(2)}L`,
                    percentage:
                        (distribution.starter.revenue / (totalRevenue || 1)) * 100,
                },
            ],
        };
    }
}
