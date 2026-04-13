import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Razorpay from "razorpay";
import * as crypto from "crypto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tenant, TenantType } from "@shared/database/entities/core/tenant.entity";
import { ResellerConfig } from "@shared/database/entities/core/reseller-config.entity";
import { AdminConfigService } from "../admin/services/admin-config.service";
import { PlansService } from "./plans.service";

export interface CreateSubscriptionDto {
  tenantId: string;
  planId: string;
  customerId?: string;
  email: string;
  phone: string;
}

export interface RazorpayPlan {
  id: string;
  name: string;
  priceInr: number;
  interval: string;
  features: string[];
}

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);



  constructor(
    private configService: ConfigService,
    private adminConfigService: AdminConfigService,
    @Inject(forwardRef(() => PlansService))
    private plansService: PlansService,
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    @InjectRepository(ResellerConfig)
    private configRepo: Repository<ResellerConfig>,
  ) {
    this.logger.log("RazorpayService initialized — credentials loaded dynamically from admin config");
  }

  /**
   * Returns a Razorpay client using credentials from admin config (DB-backed).
   * Falls back to env vars for backward compatibility.
   */
  private async getGlobalRazorpayClient(): Promise<Razorpay> {
    const keyId = await this.adminConfigService.getConfigValue("razorpay.key_id");
    const keySecret = await this.adminConfigService.getConfigValue("razorpay.key_secret");
    if (!keyId || !keySecret) throw new Error("Razorpay credentials not configured in Admin Panel");
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  async getPlans(): Promise<RazorpayPlan[]> {
    const plans = await this.plansService.findAll();
    return plans.map((p: any) => ({
      id: p.razorpayPlanId || `plan_${p.slug}`,
      name: p.name,
      priceInr: p.price,
      interval: "monthly",
      features: p.features || [],
    }));
  }

  async getPlanById(planId: string): Promise<RazorpayPlan | undefined> {
    const plans = await this.getPlans();
    return plans.find((p) => p.id === planId);
  }

  async getRazorpayClient(tenantId?: string): Promise<Razorpay> {
    if (!tenantId) {
      return this.getGlobalRazorpayClient();
    }

    try {
      const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
      if (tenant && tenant.type === TenantType.REGULAR && tenant.resellerId) {
        const resellerConfig = await this.configRepo.findOne({
          where: { tenantId: tenant.resellerId },
        });

        if (
          resellerConfig &&
          resellerConfig.paymentGateway &&
          resellerConfig.paymentGateway.razorpayKeyId &&
          resellerConfig.paymentGateway.razorpayKeySecret
        ) {
          return new Razorpay({
            key_id: resellerConfig.paymentGateway.razorpayKeyId,
            key_secret: resellerConfig.paymentGateway.razorpayKeySecret,
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error resolving Razorpay client for tenant ${tenantId}`, error);
    }

    // Fallback to global client (from admin config)
    return this.getGlobalRazorpayClient();
  }

  async createCustomer(email: string, phone: string, name: string): Promise<any> {
    try {
      const client = await this.getGlobalRazorpayClient();
      const customer = await client.customers.create({ name, email, contact: phone });
      return customer;
    } catch (error) {
      this.logger.error("Failed to create Razorpay customer", error);
      throw error;
    }
  }

  async createSubscription(dto: CreateSubscriptionDto): Promise<any> {
    try {
      const plan = await this.getPlanById(dto.planId);
      if (!plan) {
        throw new Error(`Plan ${dto.planId} not found`);
      }

      const client = await this.getRazorpayClient(dto.tenantId);

      // Create subscription link (short URL for payment)
      const subscription = await client.subscriptions.create({
        plan_id: dto.planId,
        customer_notify: 1,
        total_count: 12, // 12 months
        notes: {
          tenant_id: dto.tenantId,
        },
      });

      return subscription;
    } catch (error) {
      this.logger.error("Failed to create subscription", error);
      throw error;
    }
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const client = await this.getGlobalRazorpayClient();
      return await client.subscriptions.fetch(subscriptionId);
    } catch (error) {
      this.logger.error("Failed to fetch subscription", error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const client = await this.getGlobalRazorpayClient();
      return await client.subscriptions.cancel(subscriptionId);
    } catch (error) {
      this.logger.error("Failed to cancel subscription", error);
      throw error;
    }
  }

  async createPlan(name: string, amount: number, interval: "monthly" | "yearly" = "monthly", description?: string): Promise<any> {
    try {
      const client = await this.getGlobalRazorpayClient();
      const plan = await client.plans.create({
        period: interval,
        interval: 1,
        item: { name, amount: amount * 100, currency: "INR", description },
      });
      return plan;
    } catch (error) {
      this.logger.error("Failed to create Razorpay plan", error);
      throw error;
    }
  }

  async createPaymentLink(amount: number, description: string, tenantId: string): Promise<any> {
    try {
      const client = await this.getRazorpayClient(tenantId);
      const appUrl = await this.adminConfigService.getConfigValue("platform.app_url");
      const paymentLink = await (client.paymentLink as any).create({
        amount: amount * 100,
        currency: "INR",
        description,
        notes: { tenant_id: tenantId },
        callback_url: `${appUrl}/api/billing/callback`,
        callback_method: "get",
      });
      return paymentLink;
    } catch (error) {
      this.logger.error("Failed to create payment link", error);
      throw error;
    }
  }

  async verifyWebhookSignature(body: string, signature: string): Promise<boolean> {
    const webhookSecret = await this.adminConfigService.getConfigValue("razorpay.webhook_secret");
    if (!webhookSecret) {
      this.logger.error("razorpay.webhook_secret not configured in Admin Panel");
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");
    return expectedSignature === signature;
  }
}
