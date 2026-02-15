import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { Tenant, TenantType } from '../../tenants/entities/tenant.entity';
import { Message } from '../../messages/entities/message.entity';
import {
  Subscription,
  SubscriptionStatus,
} from '../../billing/entities/subscription.entity';
import { AuditService } from '../../audit/audit.service';
import { AdminHealthService } from './admin-health.service';
import { WebhookEndpoint } from '../../billing/entities/webhook-endpoint.entity';

@Injectable()
export class AdminAnalyticsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(WebhookEndpoint)
    private webhookEndpointRepo: Repository<WebhookEndpoint>,
    private auditService: AuditService,
    private adminHealthService: AdminHealthService,
  ) { }

  async getDashboardStats() {
    const totalTenants = await this.tenantRepo.count();
    const totalResellers = await this.tenantRepo.count({
      where: { type: TenantType.RESELLER },
    });

    const creditsResult = await this.tenantRepo
      .createQueryBuilder('tenant')
      .select('SUM(tenant.reseller_credits)', 'total')
      .where('tenant.type = :type', { type: TenantType.RESELLER })
      .getRawOne();
    const totalCreditsAllocated = parseInt(creditsResult?.total || '0', 10);

    const subTenantsCount = await this.tenantRepo.count({
      where: { resellerId: Not(IsNull()) } as any,
    });

    // Count messages for today (since midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesToday = await this.messageRepo.count({
      where: {
        createdAt: Between(today, new Date()),
      },
    });

    // Mock AI conversations (weighted by message volume + credits used)
    const aiConversations = Math.floor(messagesToday * 0.22);

    // Calculate real monthly revenue from active subscriptions
    const activeSubscriptions = await this.subscriptionRepo.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['tenant'],
    });

    const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => {
      if (sub.billingCycle === 'yearly') {
        return sum + sub.priceInr / 12;
      }
      return sum + sub.priceInr;
    }, 0);

    // Total subscription breakdown
    const subBreakdown = await this.subscriptionRepo
      .createQueryBuilder('sub')
      .select('sub.status', 'status')
      .addSelect('COUNT(sub.id)', 'count')
      .groupBy('sub.status')
      .getRawMany();

    // Calculate Top Tenants with real message counts
    const topTenantsData = await Promise.all(
      activeSubscriptions.slice(0, 5).map(async (sub) => {
        const messageCount = await this.messageRepo.count({
          where: { tenantId: sub.tenantId },
        });
        return {
          name: sub.tenant?.name || 'Unknown',
          plan: sub.plan
            ? (sub.plan as string).charAt(0).toUpperCase() +
            (sub.plan as string).slice(1)
            : 'Starter',
          messages: messageCount.toLocaleString(),
          revenue: `₹${sub.priceInr.toLocaleString()}`,
        };
      }),
    );

    // Format revenue in lakhs (Indian numbering)
    const revenueLakhs = (monthlyRevenue / 100000).toFixed(1);

    const systemHealth = await this.adminHealthService.checkSystemHealth();
    const recentAlerts = await this.getRecentAlerts();

    return {
      stats: [
        {
          label: 'Active Tenants',
          value: totalTenants.toLocaleString(),
          change: '+10.2%',
          up: true,
          color: 'blue'
        },
        {
          label: 'Total Resellers',
          value: totalResellers.toLocaleString(),
          change: '+5.0%',
          up: true,
          color: 'indigo'
        },
        {
          label: 'MRR',
          value: `₹${revenueLakhs}L`,
          change: '+15.5%',
          up: true,
          color: 'green'
        },
        {
          label: 'Messages Today',
          value: messagesToday.toLocaleString(),
          change: '+12.1%',
          up: true,
          color: 'purple'
        },
        {
          label: 'AI Conversations',
          value: aiConversations.toLocaleString(),
          change: '+5.4%',
          up: true,
          color: 'amber'
        },
        {
          label: 'Health Status',
          value: '99.9%',
          change: 'Normal',
          up: true,
          color: 'emerald'
        }
      ],
      subscriptionBreakdown: subBreakdown,
      systemHealth,
      recentAlerts,
      topTenants: topTenantsData,
      resellerStats: {
        totalResellers,
        totalCreditsAllocated,
        subTenantsCount,
        // Estimation for now, could be real revenue if linked to payments
        partnerRevenue: totalResellers * 50000,
      }
    };
  }

  async getRecentAlerts() {
    // Fetch last 4 significant audit logs as alerts
    const logs = await this.auditService.getLogs(4);

    return logs.map((log) => {
      let type = 'info';
      if (log.action.includes('DELETE')) type = 'error';
      if (log.action.includes('UPDATE')) type = 'warning';
      if (log.action.includes('CREATE')) type = 'success';

      // Humanize time (basic)
      const diff = Date.now() - log.timestamp.getTime();
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(mins / 60);
      const timeStr =
        hours > 0
          ? `${hours} hours ago`
          : mins > 0
            ? `${mins} mins ago`
            : 'just now';

      return {
        type,
        message: `${log.actorName} performed ${log.action.replace(/_/g, ' ')} on ${log.target}`,
        time: timeStr,
      };
    });
  }

  async getAnalyticsTrends(period: string = '7d') {
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Revenue Trend (Group by createdAt date)
    const revenueRaw = await this.subscriptionRepo
      .createQueryBuilder('subscription')
      .select("to_char(subscription.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('SUM(subscription.priceInr)', 'value')
      .where('subscription.createdAt >= :startDate', { startDate })
      .andWhere('subscription.status != :status', { status: 'cancelled' })
      .groupBy("to_char(subscription.createdAt, 'YYYY-MM-DD')")
      .getRawMany();

    // Message Volume Trend
    const messagesRaw = await this.messageRepo
      .createQueryBuilder('message')
      .select("to_char(message.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(message.id)', 'value')
      .where('message.createdAt >= :startDate', { startDate })
      .groupBy("to_char(message.createdAt, 'YYYY-MM-DD')")
      .getRawMany();

    // Fill missing dates
    const revenueData = [];
    const messagesData = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const revEntry = revenueRaw.find((r) => r.date === dateStr);
      const msgEntry = messagesRaw.find((r) => r.date === dateStr);

      revenueData.push({
        date: dateStr,
        value: revEntry ? parseFloat(revEntry.value) : 0,
      });

      messagesData.push({
        date: dateStr,
        value: msgEntry ? parseInt(msgEntry.value) : 0,
      });
    }

    return { revenue: revenueData, messages: messagesData };
  }

  async getSystemAlerts() {
    const alerts = [];

    // 2. Check High Message Failure Rate (Last hour)
    const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const failedMessages = await this.messageRepo.count({
      where: { status: 'failed', createdAt: Between(anHourAgo, new Date()) },
    });

    if (failedMessages > 50) {
      alerts.push({
        id: 'alert-msg-fail',
        type: 'critical',
        title: 'High Message Failure Rate',
        description: `${failedMessages} messages failed in the last hour`,
        source: 'WhatsApp Gateway',
        time: '1 hour ago',
        acknowledged: false,
      });
    }

    // 3. Check Webhook Failures
    const failingWebhooks = await this.webhookEndpointRepo.count({
      where: { failureCount: 10 },
    });

    if (failingWebhooks > 0) {
      alerts.push({
        id: 'alert-webhook-fail',
        type: 'warning',
        title: 'Webhook Delivery Failures',
        description: `${failingWebhooks} endpoints are failing consistently`,
        source: 'Webhooks',
        time: 'Now',
        acknowledged: false,
      });
    }

    return alerts;
  }
}
