import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Tenant } from "@shared/database/entities/core/tenant.entity";

@Entity("campaigns")
export class Campaign {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column()
  name: string;

  @Column({ name: "template_id", type: "uuid", nullable: true })
  templateId: string;

  @ManyToOne("Template", { nullable: true })
  @JoinColumn({ name: "template_id" })
  template: any; // avoiding circular import issues for now, or import properly

  @Column({ name: "scheduled_at", nullable: true })
  scheduledAt: Date;

  @Column({ default: "draft" })
  status: string; // draft, sending, completed, failed

  @Column({ default: 0 })
  sentCount: number;

  @Column({ default: 0 })
  failedCount: number;

  @Column({ default: 0 })
  totalContacts: number;

  // New Fields for Advanced Targeting
  @Column({ nullable: true })
  templateName: string;

  @Column({ nullable: true })
  templateLanguage: string; // e.g. en_US

  @Column({ default: "ALL" })
  recipientType: string; // ALL, CSV, MANUAL, SEGMENT

  @Column("jsonb", { nullable: true })
  recipients: any[]; // Stores array of { name, phoneNumber } if CSV/MANUAL

  @Column("jsonb", { nullable: true })
  segmentationConfig: any; // e.g. { tags: ['VIP'], status: 'QUALIFIED' }

  // Multi-Variant (A/B/C/D) Testing
  @Column({ name: "is_ab_test", default: false })
  isABTest: boolean;

  @Column({ type: "jsonb", nullable: true })
  variants: { templateName: string, templateLanguage: string, weight: number }[]; 
  // Array of up to 4 templates for A/B/C/D testing

  @Column({ name: "split_strategy", default: "EQUAL" })
  splitStrategy: string; // EQUAL, WEIGHTED

  // Recurrence & Scheduling
  @Column({ name: "is_recurring", default: false })
  isRecurring: boolean;

  @Column({ name: "recurrence_rule", nullable: true })
  recurrenceRule: string; // CRON string (e.g. "0 9 * * 1")

  @Column({ name: "next_run_at", nullable: true })
  nextRunAt: Date;

  @Column({ name: "last_run_at", nullable: true })
  lastRunAt: Date;

  @Column({ name: "error_log", type: "text", nullable: true })
  errorLog: string;

  // New Fields for Broadcasting Analytics & Billing
  @Column({ default: 0 })
  deliveredCount: number;

  @Column({ default: 0 })
  readCount: number;

  @Column({ name: "conversion_count", default: 0 })
  conversionCount: number;

  @Column({ name: "total_revenue", type: "decimal", precision: 12, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  totalCost: number;

  @Column({ name: "is_triggered", default: false })
  isTriggered: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
