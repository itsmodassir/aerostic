import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tenant } from "../core/tenant.entity";

@Entity("usage_events")
@Index(["tenantId", "createdAt"])
export class UsageEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column()
  @Index()
  metric: string; // 'messages_sent', 'ai_credits', 'broadcasts_sent'

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ nullable: true })
  referenceId: string; // ID of message, campaign, or automation execution

  @Column({ type: "jsonb", nullable: true })
  metadata: any; // Cost tracking, token count, etc.

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
