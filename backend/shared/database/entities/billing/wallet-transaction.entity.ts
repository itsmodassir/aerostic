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
import { WalletAccount } from "@shared/database/entities/billing/wallet-account.entity";

export enum TransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
}

@Entity("wallet_transactions")
@Index(["tenantId", "createdAt"])
@Index(["walletAccountId", "createdAt"])
export class WalletTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ name: "wallet_account_id", type: "uuid" })
  @Index()
  walletAccountId: string;

  @ManyToOne(() => WalletAccount, { onDelete: "CASCADE" })
  @JoinColumn({ name: "wallet_account_id" })
  walletAccount: WalletAccount;

  @Column({
    type: "enum",
    enum: TransactionType,
  })
  type: TransactionType;

  @Column("decimal", { precision: 20, scale: 8 })
  amount: number;

  @Column("decimal", { precision: 20, scale: 8, name: "balance_before" })
  balanceBefore: number;

  @Column("decimal", { precision: 20, scale: 8, name: "balance_after" })
  balanceAfter: number;

  @Column({ name: "reference_type", nullable: true })
  referenceType: string;

  @Column({ name: "reference_id", nullable: true })
  referenceId: string;

  @Column({ name: "idempotency_key", unique: true, nullable: true })
  idempotencyKey: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @Column({ type: "varchar", length: 64, nullable: true })
  hash: string;

  @Column({ name: "previous_transaction_id", type: "uuid", nullable: true })
  previousTransactionId: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
