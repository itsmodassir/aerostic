import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Plan } from "../billing/plan.entity";
import { ResellerConfig } from "./reseller-config.entity";
import { EncryptionTransformer } from "@shared/database/transformers/encryption.transformer";

export enum TenantType {
  REGULAR = "regular",
  RESELLER = "reseller",
}

@Entity("tenants")
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: TenantType, default: TenantType.REGULAR })
  @Index()
  type: TenantType;

  @Column({ name: "reseller_id", nullable: true })
  @Index()
  resellerId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.subTenants, { nullable: true })
  @JoinColumn({ name: "reseller_id" })
  reseller: Tenant;

  @OneToMany(() => Tenant, (tenant) => tenant.reseller)
  subTenants: Tenant[];

  @OneToOne(() => ResellerConfig, (config) => config.tenant)
  resellerConfig: ResellerConfig;

  @Column()
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ name: "plan_id", nullable: true })
  planId: string;

  @ManyToOne(() => Plan, { nullable: true })
  @JoinColumn({ name: "plan_id" })
  planRelation: Plan;

  // Legacy field, keeping for backward compatibility or migration
  @Column({ default: "starter" })
  plan: string;

  @Column({ default: "active" })
  @Index()
  status: string;

  // Subscription
  @Column({ name: "subscription_status", default: "trialing" })
  subscriptionStatus: string; // trialing, active, past_due, cancelled

  @Column({ name: "trial_ends_at", nullable: true })
  trialEndsAt: Date;

  @Column({ name: "razorpay_customer_id", nullable: true })
  razorpayCustomerId: string;

  @Column({ name: "razorpay_subscription_id", nullable: true })
  razorpaySubscriptionId: string;

  @Column({ name: "current_period_end", nullable: true })
  currentPeriodEnd: Date;

  // Limits (Configuration-based, not mutable counters)
  @Column({ name: "monthly_message_limit", default: 1000 })
  monthlyMessageLimit: number;

  @Column({ name: "messages_sent_this_month", default: 0 })
  messagesSentThisMonth: number;

  @Column({ name: "ai_credits", default: 100 })
  aiCredits: number;

  @Column({ name: "ai_credits_used", default: 0 })
  aiCreditsUsed: number;

  @Column({
    name: "reseller_credits",
    default: 0,
    comment: "Credits allocated to reseller to distribute",
  })
  resellerCredits: number;

  @Column({ name: "max_users", default: 10 })
  maxUsers: number;

  // Developer Access
  @Column({ name: "api_access_enabled", default: false })
  apiAccessEnabled: boolean;

  @Column({ name: "webhook_url", nullable: true })
  webhookUrl: string;

  @Column({
    name: "webhook_secret",
    nullable: true,
    transformer: new EncryptionTransformer(),
  })
  webhookSecret: string;

  // Company Info
  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  phone: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @BeforeInsert()
  generateSlug() {
    if (!this.slug && this.name) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
  }
}
