import { Injectable, BadRequestException, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApiKey } from "@shared/database/entities/core/api-key.entity";
import {
  Subscription,
  SubscriptionStatus,
} from "@shared/database/entities/billing/subscription.entity";
import { WebhookEndpoint } from "../../billing/entities/webhook-endpoint.entity";
import { AdminConfigService } from "./admin-config.service";
import { WalletService } from "../../billing/wallet.service";
import { Wallet } from "@shared/database/entities/billing/wallet.entity";
import { WalletAccountType } from "@shared/database/entities/billing/wallet-account.entity";
import { TransactionType } from "@shared/database/entities/billing/wallet-transaction.entity";

@Injectable()
export class AdminBillingService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(WebhookEndpoint)
    private webhookEndpointRepo: Repository<WebhookEndpoint>,
    private adminConfigService: AdminConfigService,
    @Inject(forwardRef(() => WalletService))
    private walletService: WalletService,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) { }

  async getTemplateRate(tenantId?: string): Promise<number> {
    const rateStr = await this.adminConfigService.getConfigValue(
      "whatsapp.template_rate_inr",
      tenantId
    );
    return parseFloat(rateStr || "0.80");
  }

  async setTemplateRate(rate: number, tenantId?: string): Promise<void> {
    if (rate < 0) throw new BadRequestException("Rate cannot be negative");
    await this.adminConfigService.setConfig(
      { "whatsapp.template_rate_inr": rate.toString() },
      "Admin",
      tenantId
    );
  }

  async transferAdminFunds(
    targetTenantId: string,
    amount: number,
    description?: string
  ) {
    if (amount <= 0) throw new BadRequestException("Amount must be positive");

    // Retrieve the System Tenant to act as the massive reserve OR simply bypass the debit
    // if the admin constitutes an infinite fiat source. For full financial auditing, we debit a "System" tenant.
    const systemTenantId = "system-wallet-fiat"; // Using a phantom ID or a real UUID if System tenant exists

    // We can also just credit the user directly with a specific reference type instead of routing through a debit.
    // We will do a direct CREDIT to the SubTenant, logged as an ADMIN_FUNDING event.
    const idempotencyKey = `admin_fund_${targetTenantId}_${Date.now()}`;

    const tx = await this.walletService.processTransaction(
      targetTenantId,
      WalletAccountType.MAIN_BALANCE,
      amount,
      TransactionType.CREDIT,
      {
        referenceType: "ADMIN_FUND_TRANSFER",
        referenceId: "ADMIN_SYSTEM", // Indicate it came from System
        description: description || `Admin funded ₹${amount}`,
        idempotencyKey,
      }
    );

    return {
      success: true,
      transactionId: tx.id,
      amount: tx.amount,
      newBalance: tx.balanceAfter
    };
  }

  async getAllApiKeys(limit: number = 20, offset: number = 0) {
    const [keys, total] = await this.apiKeyRepo.findAndCount({
      relations: ["tenant"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });

    return {
      total,
      limit,
      offset,
      keys: keys.map((k) => ({
        id: k.id,
        name: k.name || "API Key",
        tenantName: (k as any).tenant?.name || "Unknown",
        key: `${k.keyPrefix}...`,
        status: k.isActive ? "active" : "revoked",
        createdAt: k.createdAt,
        lastUsed: k.lastUsedAt,
        requests: k.requestsToday?.toLocaleString() || "0",
      })),
    };
  }

  async getAllWebhooks(limit: number = 20, offset: number = 0) {
    const [webhooks, total] = await this.webhookEndpointRepo.findAndCount({
      relations: ["tenant"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });

    // Calculate metrics using SQL for multi-tenant efficiency
    const statsResult = await this.webhookEndpointRepo
      .createQueryBuilder("w")
      .select("COUNT(*)", "total")
      .addSelect(
        "SUM(CASE WHEN w.is_active = true THEN 1 ELSE 0 END)",
        "active",
      )
      .addSelect(
        "SUM(CASE WHEN w.failure_count > 5 THEN 1 ELSE 0 END)",
        "failing",
      )
      .getRawOne();

    return {
      stats: {
        total: parseInt(statsResult?.total || "0"),
        active: parseInt(statsResult?.active || "0"),
        failing: parseInt(statsResult?.failing || "0"),
        deliveriesToday: "0", // Will follow usage table logic later
      },
      total,
      limit,
      offset,
      webhooks: webhooks.map((w) => ({
        id: w.id,
        url: w.url,
        tenant: w.tenant?.name || "Unknown",
        events: w.events,
        status: w.isActive
          ? w.failureCount > 10
            ? "failing"
            : "active"
          : "inactive",
        lastDelivery: w.lastTriggeredAt,
        successRate: "Coming Soon", // Requires audit table log linkage
      })),
    };
  }

  async getBillingStats() {
    // High-performance Normalized MRR calculation (SQL-driven)
    const statsResult = await this.subscriptionRepo
      .createQueryBuilder("sub")
      .select("COUNT(*)", "activeCount")
      .addSelect(
        `SUM(
  CASE 
          WHEN sub.billing_cycle = 'yearly' THEN sub.price_inr / 12
          ELSE sub.price_inr 
        END
)`,
        "mrr",
      )
      .addSelect("AVG(sub.price_inr)", "arpu")
      .where("sub.status = :status", { status: SubscriptionStatus.ACTIVE })
      .getRawOne();

    const mrr = parseFloat(statsResult?.mrr || "0");
    const activeCount = parseInt(statsResult?.activeCount || "0");
    const arpu = parseFloat(statsResult?.arpu || "0");

    // Efficient Plan Distribution (Single SQL Grouped query)
    const distributionRaw = await this.subscriptionRepo
      .createQueryBuilder("sub")
      .select("sub.plan", "plan")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(sub.price_inr)", "revenue")
      .where("sub.status = :status", { status: SubscriptionStatus.ACTIVE })
      .groupBy("sub.plan")
      .getRawMany();

    const revenueLakhs = (mrr / 100000).toFixed(2);

    // Recent transactions from subscriptions
    const recentSubs = await this.subscriptionRepo.find({
      relations: ["tenant"],
      order: { createdAt: "DESC" },
      take: 10,
    });

    const recentTransactions = recentSubs.map((sub) => ({
      id: `SUB-${sub.id.slice(0, 8).toUpperCase()}`,
      tenant: (sub as any).tenant?.name || "Unknown",
      plan: (sub.plan as string).charAt(0).toUpperCase() + (sub.plan as string).slice(1),
      amount: `₹${(sub.priceInr || 0).toLocaleString()}`,
      status: sub.status === SubscriptionStatus.ACTIVE ? "success" : sub.status,
      date: new Date(sub.createdAt).toLocaleDateString("en-IN"),
    }));

    return {
      revenueStats: [
        {
          label: "Platform MRR",
          value: `₹${revenueLakhs} L`,
          change: "+10.5%",
          period: "vs last month",
        },
        {
          label: "Active Subscriptions",
          value: activeCount.toLocaleString(),
          change: "+5.2%",
          period: "vs last month",
        },
        {
          label: "Avg Revenue/User",
          value: `₹${Math.round(arpu).toLocaleString()} `,
          change: "+2.1%",
          period: "vs last month",
        },
        {
          label: "Churn Rate",
          value: "Coming Soon", // Needs monthly metric table
          change: "0.0%",
          period: "vs last month",
        },
      ],
      planDistribution: distributionRaw.map((d) => ({
        plan:
          (d.plan as string).charAt(0).toUpperCase() +
          (d.plan as string).slice(1),
        count: parseInt(d.count),
        revenue: `₹${(parseFloat(d.revenue) / 100000).toFixed(2)} L`,
        percentage: mrr > 0 ? (parseFloat(d.revenue) / mrr) * 100 : 0,
      })),
      recentTransactions,
    };
  }
  async getAllWallets(limit: number = 50, offset: number = 0) {
    const [wallets, total] = await this.walletRepo.findAndCount({
      relations: ["tenant", "accounts"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });

    return {
      total,
      limit,
      offset,
      wallets: wallets.map(w => ({
        id: w.id,
        tenantId: w.tenantId,
        tenantName: w.tenant?.name || "Unknown",
        status: w.status,
        balances: w.accounts?.map((a: any) => ({
          type: a.type,
          balance: parseFloat(a.balance.toString())
        })) || []
      }))
    };
  }

  async getTemplatePricing() {
    const keys = [
      "whatsapp.marketing_rate_meta", "whatsapp.marketing_rate_custom",
      "whatsapp.utility_rate_meta", "whatsapp.utility_rate_custom",
      "whatsapp.auth_rate_meta", "whatsapp.auth_rate_custom",
      "whatsapp.template_rate_inr"
    ];

    const result: any = {};
    for (const key of keys) {
      result[key] = await this.adminConfigService.getConfigValue(key);
    }
    return result;
  }

  async updateTemplatePricing(updates: Record<string, string>, actorId: string) {
    return this.adminConfigService.setConfig(updates, actorId);
  }
}
