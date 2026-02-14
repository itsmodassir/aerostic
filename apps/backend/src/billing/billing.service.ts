import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
  PlanType,
} from './entities/subscription.entity';
import { ApiKey } from './entities/api-key.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { RazorpayService } from './razorpay.service';
import * as crypto from 'crypto';
import { AuditService } from '../audit/audit.service';
import { LogCategory, LogLevel } from '../audit/entities/audit-log.entity';
import { RazorpayEvent } from './entities/razorpay-event.entity';
import { MailService } from '../common/mail.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Plan } from './entities/plan.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Invoice } from './entities/invoice.entity';
import { UsageMetric } from './entities/usage-metric.entity';

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
    @InjectRepository(UsageMetric)
    private usageMetricRepo: Repository<UsageMetric>,
    @InjectRepository(RazorpayEvent)
    private eventRepo: Repository<RazorpayEvent>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Plan)
    private planRepo: Repository<Plan>,
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    private razorpayService: RazorpayService,
    private auditService: AuditService,
    private mailService: MailService,
    private usersService: UsersService,
  ) { }

  // ============ WEBHOOK HANDLING & IDEMPOTENCY ============

  async handleWebhookEvent(body: any): Promise<{ received: boolean }> {
    const eventName = body.event;
    const payload = body.payload;

    // 1. Idempotency Check
    // Try to get a unique event ID. Razorpay sends 'x-razorpay-event-id' header usually.
    // If we only have body, we construct a unique ID from entity ID + event name strategy or hash.
    // Ideally controller passes the ID. Here we will use payload entity ID if available as best effort unique key per event type.
    const entityId =
      payload.payment?.entity?.id || payload.subscription?.entity?.id;
    const uniqueEventId =
      body.id ||
      (entityId
        ? `${eventName}_${entityId}`
        : `evt_${Date.now()}_${Math.random()}`);

    const existingEvent = await this.eventRepo.findOne({
      where: { eventId: uniqueEventId },
    });

    if (existingEvent) {
      this.logger.log(`Duplicate webhook event handled: ${uniqueEventId}`);
      return { received: true };
    }

    // 2. Persist Event immediately
    await this.eventRepo.save(
      this.eventRepo.create({
        eventId: uniqueEventId,
        event: eventName,
        payload: body, // Store full body for debugging/replay
        status: 'processing',
      }),
    );

    try {
      // 3. Process Event
      switch (eventName) {
        case 'subscription.activated':
          await this.activateSubscription(
            payload.subscription.entity.notes.tenant_id,
            payload.subscription.entity.id,
            payload.subscription.entity.plan_id,
          );
          break;
        case 'subscription.cancelled':
        case 'subscription.expired':
          // Handle cancellation logic here
          break;
        case 'payment.captured':
          await this.generateAndSendInvoice(
            payload.payment.entity.id,
            payload.payment.entity.amount,
            payload.payment.entity.notes?.tenant_id,
          );
          break;
      }

      // 4. Update status to processed
      await this.eventRepo.update(
        { eventId: uniqueEventId },
        { status: 'processed' },
      );
    } catch (error) {
      this.logger.error(
        `Failed to process webhook event ${uniqueEventId}`,
        error,
      );
      await this.eventRepo.update(
        { eventId: uniqueEventId },
        { status: 'failed' },
      );
      // We still return 200 to Razorpay usually to stop retries if it's a logic error,
      // unless it's transient. For now returning success to acknowledge receipt.
    }

    return { received: true };
  }

  // ============ SUBSCRIPTIONS ============

  async getSubscription(tenantId: string): Promise<Subscription | null> {
    return this.subscriptionRepo.findOne({ where: { tenantId } });
  }

  async createTrialSubscription(tenantId: string): Promise<Subscription> {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7-day trial

    const subscription = this.subscriptionRepo.create({
      tenantId,
      plan: PlanType.STARTER,
      status: SubscriptionStatus.TRIAL,
      trialEndsAt,
      monthlyMessages: 1000,
      aiCredits: 100,
      maxAgents: 1,
    });

    const saved = await this.subscriptionRepo.save(subscription);

    // Audit trial creation
    await this.auditService.logAction(
      'SYSTEM',
      'Billing Service',
      'CREATE_TRIAL',
      `Tenant: ${tenantId}`,
      tenantId,
      { status: saved.status, plan: saved.plan },
      undefined,
      LogLevel.SUCCESS,
      LogCategory.BILLING,
      'BillingService',
    );

    return saved;
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
      plan_starter: PlanType.STARTER,
      plan_growth: PlanType.GROWTH,
      plan_enterprise: PlanType.ENTERPRISE,
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
    subscription.currentPeriodEnd = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    );

    const saved = await this.subscriptionRepo.save(subscription);

    // Audit subscription activation
    await this.auditService.logAction(
      'SYSTEM',
      'Billing Service',
      'ACTIVATE_SUBSCRIPTION',
      `Plan: ${planType}`,
      tenantId,
      { subscriptionId: razorpaySubscriptionId, plan: planType },
      undefined,
      LogLevel.SUCCESS,
      LogCategory.BILLING,
      'BillingService',
    );

    return saved;
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
      subscription.currentPeriodEnd = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      );
    }

    const saved = await this.subscriptionRepo.save(subscription);

    // Audit manual update
    await this.auditService.logAction(
      'SYSTEM',
      'Billing Service',
      'MANUAL_UPDATE_SUBSCRIPTION',
      `Plan: ${plan}, Status: ${status}`,
      tenantId,
      { plan, status },
      undefined,
      LogLevel.INFO,
      LogCategory.BILLING,
      'BillingService',
    );

    return saved;
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

  async findAllApiKeys(): Promise<ApiKey[]> {
    return this.apiKeyRepo.find({
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async checkPlanFeature(tenantId: string, feature: string): Promise<boolean> {
    const tenant = await this.tenantRepo.findOne({
      where: { id: tenantId },
      relations: ['planRelation'],
    });

    if (!tenant) return false;

    // Fallback to legacy plan logic if no plan relation
    if (!tenant.planRelation) {
      if (tenant.plan === 'enterprise') return true;
      if (tenant.plan === 'growth' && feature === 'api_access') return true;
      if (feature === 'webhooks' && tenant.plan !== 'starter') return true;
      return false;
    }

    return tenant.planRelation.features?.includes(feature) || false;
  }

  async createApiKey(
    tenantId: string,
    name: string,
    permissions: string[],
  ): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const allowed = await this.checkPlanFeature(tenantId, 'api_access');
    if (!allowed) {
      throw new ForbiddenException('API Access is not available in your plan');
    }

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

    const saved = await this.apiKeyRepo.save(apiKey);

    // Audit API key creation
    await this.auditService.logAction(
      'SYSTEM',
      'Billing Service',
      'CREATE_API_KEY',
      `Key Name: ${name}`,
      tenantId,
      { keyId: saved.id, prefix: keyPrefix },
      undefined,
      LogLevel.INFO,
      LogCategory.SECURITY,
      'BillingService',
    );

    // Return raw key only once - user must save it
    return { apiKey: saved, rawKey };
  }

  async validateApiKey(rawKey: string): Promise<ApiKey | null> {
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const apiKey = await this.apiKeyRepo.findOne({
      where: { keyHash, isActive: true },
    });

    if (apiKey) {
      apiKey.lastUsedAt = new Date();
      apiKey.requestsToday++;
      await this.apiKeyRepo.save(apiKey);
    }

    return apiKey;
  }

  async revokeApiKey(tenantId: string, keyId: string): Promise<void> {
    await this.apiKeyRepo.update({ id: keyId, tenantId }, { isActive: false });

    // Audit API key revocation
    await this.auditService.logAction(
      'SYSTEM',
      'Billing Service',
      'REVOKE_API_KEY',
      `Key ID: ${keyId}`,
      tenantId,
      undefined,
      undefined,
      LogLevel.WARNING,
      LogCategory.SECURITY,
      'BillingService',
    );
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

  async updateWebhookEndpoint(
    id: string,
    update: { url?: string; events?: string[]; isActive?: boolean },
  ) {
    await this.webhookRepo.update({ id }, update);
    return this.webhookRepo.findOneBy({ id });
  }

  async triggerWebhooks(
    tenantId: string,
    event: string,
    payload: any,
  ): Promise<void> {
    const webhooks = await this.webhookRepo.find({
      where: { tenantId, isActive: true },
    });

    for (const webhook of webhooks) {
      if (webhook.events.includes(event) || webhook.events.includes('*')) {
        this.sendWebhook(webhook, event, payload);
      }
    }
  }

  private async sendWebhook(
    webhook: WebhookEndpoint,
    event: string,
    payload: any,
  ): Promise<void> {
    try {
      const body = JSON.stringify({
        event,
        data: payload,
        timestamp: new Date().toISOString(),
      });
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(body)
        .digest('hex');

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

  private async generateAndSendInvoice(
    paymentId: string,
    amount: number,
    tenantId: string,
  ) {
    try {
      if (!tenantId) {
        this.logger.warn(
          `No tenantId found in payment notes for ${paymentId}, skipping invoice`,
        );
        return;
      }

      this.logger.log(
        `Generating invoice for payment ${paymentId}, tenant ${tenantId}`,
      );

      // 1. Get primary contact (owner) for the tenant
      const user = await this.userRepo
        .createQueryBuilder('user')
        .innerJoin('user.memberships', 'membership')
        .where('membership.tenantId = :tenantId', { tenantId })
        .getOne();

      if (!user) {
        this.logger.warn(
          `No user found for tenant ${tenantId}, skipping invoice email`,
        );
        return;
      }

      // 2. Format data
      const invoiceData = {
        id: `INV-${paymentId.replace('pay_', '')}`,
        amount: amount / 100, // Razorpay amount is in paise
        date: new Date().toLocaleDateString(),
      };

      // 3. Send via MailService
      await this.mailService.sendInvoiceEmail(user.email, invoiceData);

      this.logger.log(
        `Invoice email sent to ${user.email} for payment ${paymentId}`,
      );

      // 4. Save Invoice to DB
      const invoice = this.invoiceRepo.create({
        tenantId,
        amount: amount / 100,
        status: 'paid',
        date: new Date(),
        razorpayPaymentId: paymentId,
      });
      await this.invoiceRepo.save(invoice);

    } catch (error) {
      this.logger.error(
        `Failed to generate/send invoice for payment ${paymentId}`,
        error,
      );
    }
  }

  // ============ DASHBOARD DATA ============

  async getInvoices(tenantId: string): Promise<Invoice[]> {
    return this.invoiceRepo.find({
      where: { tenantId },
      order: { date: 'DESC' },
    });
  }

  async countUsers(tenantId: string): Promise<number> {
    return this.usersService.findAllByTenant(tenantId).then((users) => users.length);
  }

  async getUsageMetrics(tenantId: string) {
    const today = new Date();
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const metrics = await this.usageMetricRepo.find({
      where: {
        tenantId,
        periodStart,
      },
    });

    const messages = metrics.find(m => m.metric === 'messages_sent')?.value || 0;
    const aiCredits = metrics.find(m => m.metric === 'ai_credits')?.value || 0;
    const broadcasts = metrics.find(m => m.metric === 'broadcasts_sent')?.value || 0;

    return {
      messages,
      aiCredits,
      broadcasts,
      periodStart,
      periodEnd
    };
  }

  async incrementUsage(tenantId: string, metric: string, amount: number = 1) {
    const today = new Date();
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let usage = await this.usageMetricRepo.findOne({
      where: { tenantId, metric, periodStart },
    });

    if (!usage) {
      usage = this.usageMetricRepo.create({
        tenantId,
        metric,
        value: 0,
        periodStart,
        periodEnd,
      });
    }

    usage.value += amount;
    await this.usageMetricRepo.save(usage);
  }
}
