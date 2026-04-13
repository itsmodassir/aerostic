import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  Index,
} from "typeorm";
import { Tenant } from "../core/tenant.entity";

export enum AddonType {
  CART_RECOVERY_AI = "cart_recovery_ai",
  AUTOMATE_SALES = "automate_sales",
  AI_CREDITS = "ai_credits",
  CAMPAIGNS = "campaigns",
}

@Entity("addons")
export class Addon {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ type: "enum", enum: AddonType })
  type: AddonType;

  @Column({ default: "active" }) // active, canceled, expired
  status: string;

  @Column({ name: "recurring_billing", default: false })
  recurringBilling: boolean;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  price: number;
  
  @Column("jsonb", { default: {} })
  metadata: Record<string, any>; // e.g., { credits_granted: 1000 }
  
  @Column({ name: "razorpay_subscription_id", nullable: true })
  razorpaySubscriptionId: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
