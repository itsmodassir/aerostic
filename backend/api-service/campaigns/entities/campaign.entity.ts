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
  recipientType: string; // ALL, CSV, MANUAL

  @Column("jsonb", { nullable: true })
  recipients: any[]; // Stores array of { name, phoneNumber } if CSV/MANUAL

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
