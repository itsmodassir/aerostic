import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';

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
      id: 'plan_starter',
      name: 'Starter',
      priceInr: 999,
      interval: 'monthly',
      features: ['1,000 Messages', '100 AI Credits', '1 Agent'],
    },
    {
      id: 'plan_starter-2',
      name: 'Starter 2',
      priceInr: 2499,
      interval: 'monthly',
      features: ['5,000 Messages', '500 AI Credits', '3 Agents'],
    },
    {
      id: 'plan_growth',
      name: 'Growth',
      priceInr: 3999,
      interval: 'monthly',
      features: ['10,000 Messages', '1,000 AI Credits', '5 Agents', 'Unlimited Broadcasts'],
    },
    {
      id: 'plan_professional',
      name: 'Professional',
      priceInr: 6999,
      interval: 'monthly',
      features: ['20,000 Messages', '2,000 AI Credits', '10 Agents', 'Unlimited Broadcasts'],
    },
  ];

  constructor(private configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      this.logger.log('Razorpay initialized');
    } else {
      this.logger.warn('Razorpay credentials not configured');
    }
  }

  getPlans(): RazorpayPlan[] {
    return RazorpayService.PLANS;
  }

  getPlanById(planId: string): RazorpayPlan | undefined {
    return RazorpayService.PLANS.find((p) => p.id === planId);
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
      this.logger.error('Failed to create Razorpay customer', error);
      throw error;
    }
  }

  async createSubscription(dto: CreateSubscriptionDto): Promise<any> {
    try {
      const plan = this.getPlanById(dto.planId);
      if (!plan) {
        throw new Error(`Plan ${dto.planId} not found`);
      }

      // Create subscription link (short URL for payment)
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: dto.planId,
        customer_notify: 1,
        total_count: 12, // 12 months
        notes: {
          tenant_id: dto.tenantId,
        },
      });

      return subscription;
    } catch (error) {
      this.logger.error('Failed to create subscription', error);
      throw error;
    }
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      return await this.razorpay.subscriptions.fetch(subscriptionId);
    } catch (error) {
      this.logger.error('Failed to fetch subscription', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      return await this.razorpay.subscriptions.cancel(subscriptionId);
    } catch (error) {
      this.logger.error('Failed to cancel subscription', error);
      throw error;
    }
  }

  async createPaymentLink(
    amount: number,
    description: string,
    tenantId: string,
  ): Promise<any> {
    try {
      // Use any to bypass strict type checking for Razorpay SDK
      const paymentLink = await (this.razorpay.paymentLink as any).create({
        amount: amount * 100, // Razorpay uses paise
        currency: 'INR',
        description,
        notes: {
          tenant_id: tenantId,
        },
        callback_url: `${this.configService.get('APP_URL')}/api/billing/callback`,
        callback_method: 'get',
      });
      return paymentLink;
    } catch (error) {
      this.logger.error('Failed to create payment link', error);
      throw error;
    }
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.configService.get('RAZORPAY_WEBHOOK_SECRET'))
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }
}
