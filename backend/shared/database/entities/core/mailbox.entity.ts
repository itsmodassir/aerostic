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

@Entity("mailboxes")
export class Mailbox {
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

  @Column({ name: "email_address" })
  emailAddress: string;

  @Column()
  provider: string; // e.g., 'gmail', 'outlook', 'custom_smtp'

  @Column({ type: "jsonb", name: "smtp_config", nullable: true })
  smtpConfig: any;

  @Column({ type: "jsonb", name: "imap_config", nullable: true })
  imapConfig: any;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
