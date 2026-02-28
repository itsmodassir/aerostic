import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Razorpay from "razorpay";
import * as crypto from "crypto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tenant, TenantType } from "@shared/database/entities/core/tenant.entity";
import { ResellerConfig } from "@shared/database/entities/core/reseller-config.entity";

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
  private razorpay: Razorpay;

  // Subscription Plans
  static readonly PLANS: RazorpayPlan[] = [
    {
      id: "plan_starter",
      name: "Starter",
      priceInr: 999,
      interval: "monthly",
      features: ["1,000 Messages", "100 AI Credits", "1 Agent"],
    },
    {
      id: "plan_starter-2",
      name: "Starter 2",
      priceInr: 2499,
      interval: "monthly",
      features: ["5,000 Messages", "500 AI Credits", "3 Agents"],
    },
    {
      id: "plan_growth",
      name: "Growth",
      priceInr: 3999,
      interval: "monthly",
      features: [
        "10,000 Messages",
        "1,000 AI Credits",
        "5 Agents",
        "Unlimited Broadcasts",
      ],
    },
    {
      id: "plan_professional",
      name: "Professional",
      priceInr: 6999,
      interval: "monthly",
      features: [
        "20,000 Messages",
        "2,000 AI Credits",
        "10 Agents",
        "Unlimited Broadcasts",
      ],
    },
  ];

  constructor(
    private configService: ConfigService,
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    @InjectRepository(ResellerConfig)
    private configRepo: Repository<ResellerConfig>,
  ) {
    const keyId = this.configService.get<string>("RAZORPAY_KEY_ID");
    const keySecret = this.configService.get<string>("RAZORPAY_KEY_SECRET");

    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      this.logger.log("Razorpay initialized");
    } else {
      this.logger.warn("Razorpay credentials not configured");
    }
  }

  getPlans(): RazorpayPlan[] {
    return RazorpayService.PLANS;
  }

  getPlanById(planId: string): RazorpayPlan | undefined {
    return RazorpayService.PLANS.find((p) => p.id === planId);
  }

  async getRazorpayClient(tenantId?: string): Promise<Razorpay> {
    if (!tenantId) {
      if (!this.razorpay) throw new Error("Global Razorpay not configured");
      return this.razorpay;
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
          // Initialize a dynamic Razorpay client for this reseller
          return new Razorpay({
            key_id: resellerConfig.paymentGateway.razorpayKeyId,
            key_secret: resellerConfig.paymentGateway.razorpayKeySecret,
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error resolving Razorpay client for tenant ${tenantId}`, error);
    }

    // Fallback to global client
    if (!this.razorpay) throw new Error("Global Razorpay not configured");
    return this.razorpay;
  }

  async createCustomer(
    email: string,
    phone: string,
    name: string,
  ): Promise<any> {
    try {
      const customer = await this.razorpay.customers.create({
        name,
        email,
        contact: phone,
      });
      return customer;
    } catch (error) {
      this.logger.error("Failed to create Razorpay customer", error);
      throw error;
    }
  }

  async createSubscription(dto: CreateSubscriptionDto): Promise<any> {
    try {
      const plan = this.getPlanById(dto.planId);
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
      return await this.razorpay.subscriptions.fetch(subscriptionId);
    } catch (error) {
      this.logger.error("Failed to fetch subscription", error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      return await this.razorpay.subscriptions.cancel(subscriptionId);
    } catch (error) {
      this.logger.error("Failed to cancel subscription", error);
      throw error;
    }
  }

  async createPlan(
    name: string,
    amount: number,
    interval: "monthly" | "yearly" = "monthly",
    description?: string,
  ): Promise<any> {
    try {
      const plan = await this.razorpay.plans.create({
        period: interval,
        interval: 1,
        item: {
          name,
          amount: amount * 100, // Amount in paise
          currency: "INR",
          description,
        },
      });
      return plan;
    } catch (error) {
      this.logger.error("Failed to create Razorpay plan", error);
      throw error;
    }
  }

  async createPaymentLink(
    amount: number,
    description: string,
    tenantId: string,
  ): Promise<any> {
    try {
      const client = await this.getRazorpayClient(tenantId);
      // Use any to bypass strict type checking for Razorpay SDK
      const paymentLink = await (client.paymentLink as any).create({
        amount: amount * 100, // Razorpay uses paise
        currency: "INR",
        description,
        notes: {
          tenant_id: tenantId,
        },
        callback_url: `${this.configService.get("APP_URL")}/api/billing/callback`,
        callback_method: "get",
      });
      return paymentLink;
    } catch (error) {
      this.logger.error("Failed to create payment link", error);
      throw error;
    }
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const webhookSecret = this.configService.get<string>(
      "RAZORPAY_WEBHOOK_SECRET",
    );
    if (!webhookSecret) {
      this.logger.error("Missing RAZORPAY_WEBHOOK_SECRET for webhook validation");
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");
    return expectedSignature === signature;
  }
}
