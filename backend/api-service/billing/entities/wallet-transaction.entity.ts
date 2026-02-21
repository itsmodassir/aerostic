import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tenant } from "@shared/database/entities/core/tenant.entity";

@Entity("wallet_transactions")
@Index(["tenantId", "createdAt"])
export class WalletTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column()
  type: string; // 'credit' | 'debit'

  @Column("decimal", { precision: 12, scale: 2 })
  amount: number;

  @Column("decimal", { precision: 12, scale: 2, name: "balance_after" })
  balanceAfter: number;

  @Column()
  description: string;

  @Column({ nullable: true })
  referenceId: string; // Razorpay payment ID or internal refund ID

  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
