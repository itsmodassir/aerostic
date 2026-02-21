import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Tenant } from "../core/tenant.entity";

@Entity("tenant_daily_metrics")
@Unique(["tenantId", "date"])
@Index(["tenantId", "date"])
export class TenantDailyMetric {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ type: "date" })
  date: string;

  @Column({ default: 0 })
  messagesSent: number;

  @Column({ default: 0 })
  messageCount: number;

  @Column({ default: 0 })
  messagesReceived: number;

  @Column({ default: 0 })
  aiCreditsUsed: number;

  @Column({ default: 0 })
  activeCampaigns: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  revenue: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
