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
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { Contact } from "@shared/database/entities/core/contact.entity";

export enum ReferralStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum RewardStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
}

@Entity("referrals")
export class Referral {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ unique: true })
  code: string;

  @Column({
    type: "enum",
    enum: ReferralStatus,
    default: ReferralStatus.PENDING,
  })
  status: ReferralStatus;

  @Column({
    name: "reward_status",
    type: "enum",
    enum: RewardStatus,
    default: RewardStatus.UNPAID,
  })
  rewardStatus: RewardStatus;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  rewardAmount: number;

  // Relations
  @Column({ name: "referrer_id", type: "uuid" })
  referrerId: string;

  @ManyToOne(() => Contact)
  @JoinColumn({ name: "referrer_id" })
  referrer: Contact;

  @Column({ name: "referee_id", nullable: true, type: "uuid" })
  refereeId: string;

  @ManyToOne(() => Contact)
  @JoinColumn({ name: "referee_id" })
  referee: Contact;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
