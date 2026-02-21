import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Tenant } from "../core/tenant.entity";

export enum SubscriptionStatus {
  TRIAL = "trial",
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum PlanType {
  STARTER = "starter",
  GROWTH = "growth",
  ENTERPRISE = "enterprise",
}

@Entity("subscriptions")
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  // Razorpay
  @Column({ name: "razorpay_subscription_id", nullable: true })
  razorpaySubscriptionId: string;

  @Column({ name: "razorpay_plan_id", nullable: true })
  razorpayPlanId: string;

  @Column({ name: "razorpay_payment_id", nullable: true })
  razorpayPaymentId: string;

  // Plan Details
  @Column({ type: "enum", enum: PlanType, default: PlanType.STARTER })
  plan: PlanType;

  @Column({ name: "price_inr", default: 1999 })
  priceInr: number;

  @Column({ name: "billing_cycle", default: "monthly" })
  billingCycle: string;

  // Status
  @Column({
    type: "enum",
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  @Index()
  status: SubscriptionStatus;

  @Column({ name: "trial_ends_at", nullable: true })
  trialEndsAt: Date;

  @Column({ name: "current_period_start", nullable: true })
  currentPeriodStart: Date;

  @Column({ name: "current_period_end", nullable: true })
  currentPeriodEnd: Date;

  @Column({ name: "cancelled_at", nullable: true })
  cancelledAt: Date;

  // Features
  @Column({ name: "monthly_messages", default: 10000 })
  monthlyMessages: number;

  @Column({ name: "ai_credits", default: 1000 })
  aiCredits: number;

  @Column({ name: "max_agents", default: 1 })
  maxAgents: number;

  @Column({ name: "api_access", default: false })
  apiAccess: boolean;

  @Column({ name: "custom_templates", default: false })
  customTemplates: boolean;

  @Column({ name: "white_label", default: false })
  whiteLabel: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
