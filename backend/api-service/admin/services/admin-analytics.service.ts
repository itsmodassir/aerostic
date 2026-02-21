import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, Not, IsNull, MoreThan } from "typeorm";
import {
  Tenant,
  TenantType,
} from "@shared/database/entities/core/tenant.entity";
import { Message } from "@shared/database/entities/messaging/message.entity";
import {
  Subscription,
  SubscriptionStatus,
} from "@shared/database/entities/billing/subscription.entity";
import { AuditService } from "@api/audit/audit.service";
import { AdminHealthService } from "./admin-health.service";
import { WebhookEndpoint } from "@api/billing/entities/webhook-endpoint.entity";
import { SystemDailyMetric } from "@shared/database/entities/analytics/system-daily-metric.entity";
import { TenantDailyMetric } from "@shared/database/entities/analytics/tenant-daily-metric.entity";

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
    @InjectRepository(SystemDailyMetric)
    private systemMetricRepo: Repository<SystemDailyMetric>,
    @InjectRepository(TenantDailyMetric)
    private tenantMetricRepo: Repository<TenantDailyMetric>,
    private auditService: AuditService,
    private adminHealthService: AdminHealthService,
  ) {}

  async getDashboardStats() {
    const todayStr = new Date().toISOString().split("T")[0];

    // Fetch pre-aggregated system metrics for today
    const todayMetrics = await this.systemMetricRepo.findOne({
      where: { date: todayStr },
    });

    const totalTenants =
      todayMetrics?.totalTenants || (await this.tenantRepo.count());
    const totalResellers = await this.tenantRepo.count({
      where: { type: TenantType.RESELLER },
    });

    const creditsResult = await this.tenantRepo
      .createQueryBuilder("tenant")
      .select("SUM(tenant.reseller_credits)", "total")
      .where("tenant.type = :type", { type: TenantType.RESELLER })
      .getRawOne();
    const totalCreditsAllocated = parseInt(creditsResult?.total || "0", 10);

    const subTenantsCount = await this.tenantRepo.count({
      where: { resellerId: Not(IsNull()) } as any,
    });

    // Scale-ready message count (from metrics instead of live table)
    const messagesToday = todayMetrics?.totalMessagesSent || 0;
    const aiConversations = todayMetrics?.totalAiCreditsUsed || 0;

    // High-performance MRR calculation (SQL-side math)
    const mrrResult = await this.subscriptionRepo
      .createQueryBuilder("sub")
      .select(
        `SUM(
        CASE 
          WHEN sub.billing_cycle = 'yearly' THEN sub.price_inr / 12
          ELSE sub.price_inr 
        END
      )`,
        "mrr",
      )
      .where("sub.status = :status", { status: SubscriptionStatus.ACTIVE })
      .getRawOne();

    const monthlyRevenue = parseFloat(mrrResult?.mrr || "0");

    // Total subscription breakdown
    const subBreakdown = await this.subscriptionRepo
      .createQueryBuilder("sub")
      .select("sub.status", "status")
      .addSelect("COUNT(sub.id)", "count")
      .groupBy("sub.status")
      .getRawMany();

    // Correcting Top Tenants N+1 Query (Single efficient grouping)
    const topTenantsRaw = await this.tenantMetricRepo
      .createQueryBuilder("tm")
      .leftJoinAndSelect("tm.tenant", "tenant")
      .select([
        "tenant.name as name",
        "SUM(tm.messagesSent) as total_messages",
        "SUM(tm.revenue) as total_revenue",
      ])
      .groupBy("tenant.id")
      .orderBy("total_messages", "DESC")
      .limit(5)
      .getRawMany();

    const topTenantsData = topTenantsRaw.map((t) => ({
      name: t.name || "Unknown",
      plan: "Growth", // Placeholder as plan info is in sub table
      messages: parseInt(t.total_messages).toLocaleString(),
      revenue: `₹${parseFloat(t.total_revenue).toLocaleString()}`,
    }));

    const revenueLakhs = (monthlyRevenue / 100000).toFixed(1);
    const systemHealth = await this.adminHealthService.checkSystemHealth();
    const recentAlerts = await this.getRecentAlerts();

    return {
      stats: [
        {
          label: "Active Tenants",
          value: totalTenants.toLocaleString(),
          change: "+10.2%",
          up: true,
          color: "blue",
        },
        {
          label: "Total Resellers",
          value: totalResellers.toLocaleString(),
          change: "+5.0%",
          up: true,
          color: "indigo",
        },
        {
          label: "MRR",
          value: `₹${revenueLakhs}L`,
          change: "+15.5%",
          up: true,
          color: "green",
        },
        {
          label: "Messages Today",
          value: messagesToday.toLocaleString(),
          change: "+12.1%",
          up: true,
          color: "purple",
        },
        {
          label: "AI Credits Used",
          value: aiConversations.toLocaleString(),
          change: "+5.4%",
          up: true,
          color: "amber",
        },
        {
          label: "Health Status",
          value: "99.9%",
          change: "Normal",
          up: true,
          color: "emerald",
        },
      ],
      subscriptionBreakdown: subBreakdown,
      systemHealth,
      recentAlerts,
      topTenants: topTenantsData,
      resellerStats: {
        totalResellers,
        totalCreditsAllocated,
        subTenantsCount,
        partnerRevenue: totalResellers * 50000,
      },
    };
  }

  async getRecentAlerts() {
    const logs = await this.auditService.getLogs(4);

    return logs.map((log) => {
      let type = "info";
      if (log.action.includes("DELETE")) type = "error";
      if (log.action.includes("UPDATE")) type = "warning";
      if (log.action.includes("CREATE")) type = "success";

      const diff = Date.now() - log.timestamp.getTime();
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(mins / 60);
      const timeStr =
        hours > 0
          ? `${hours} hours ago`
          : mins > 0
            ? `${mins} mins ago`
            : "just now";

      return {
        type,
        message: `${log.actorName} performed ${log.action.replace(/_/g, " ")} on ${log.target}`,
        time: timeStr,
      };
    });
  }

  async getAnalyticsTrends(period: string = "7d") {
    const days = period === "30d" ? 30 : period === "90d" ? 90 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Scale-ready Trend Query (Reads from pre-aggregated metrics)
    const metricsRaw = await this.systemMetricRepo.find({
      where: {
        date: MoreThan(startDate.toISOString().split("T")[0]),
      },
      order: { date: "ASC" },
    });

    return {
      revenue: metricsRaw.map((m) => ({
        date: m.date,
        value: parseFloat(m.totalRevenue as any),
      })),
      messages: metricsRaw.map((m) => ({
        date: m.date,
        value: m.totalMessagesSent,
      })),
    };
  }

  async getSystemAlerts() {
    const alerts = [];

    const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const failedMessages = await this.messageRepo.count({
      where: { status: "failed", createdAt: Between(anHourAgo, new Date()) },
    });

    if (failedMessages > 50) {
      alerts.push({
        id: "alert-msg-fail",
        type: "critical",
        title: "High Message Failure Rate",
        description: `${failedMessages} messages failed in the last hour`,
        source: "WhatsApp Gateway",
        time: "1 hour ago",
        acknowledged: false,
      });
    }

    // Fix: Accurate status check for failing webhooks
    const failingWebhooks = await this.webhookEndpointRepo.count({
      where: { failureCount: MoreThan(10) },
    });

    if (failingWebhooks > 0) {
      alerts.push({
        id: "alert-webhook-fail",
        type: "warning",
        title: "Webhook Delivery Failures",
        description: `${failingWebhooks} endpoints are failing consistently (>10)`,
        source: "Webhooks",
        time: "Now",
        acknowledged: false,
      });
    }

    return alerts;
  }
}
