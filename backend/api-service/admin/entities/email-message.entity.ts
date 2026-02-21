import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { Mailbox } from "@shared/database/entities/core/mailbox.entity";

export enum InboxFolderName {
  INBOX = "inbox",
  SENT = "sent",
  ARCHIVE = "archive",
  SPAM = "spam",
  TRASH = "trash",
  DRAFT = "draft",
}

@Entity("email_messages")
@Index(["tenantId", "mailboxId", "folder", "createdAt"])
@Index(["tenantId", "folder", "isRead"])
@Index(["tenantId", "externalId"], { unique: true })
export class EmailMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ name: "mailbox_id", type: "uuid" })
  mailboxId: string;

  @ManyToOne(() => Mailbox, { onDelete: "CASCADE" })
  @JoinColumn({ name: "mailbox_id" })
  mailbox: Mailbox;

  @Column({ name: "mailbox_name", nullable: true })
  mailboxName: string; // support, sales, etc.

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  subject: string;

  @Column({ type: "text", name: "content_text" })
  contentText: string;

  @Column({ type: "text", name: "content_html", nullable: true })
  contentHtml: string;

  @Column({ default: false, name: "is_read" })
  isRead: boolean;

  @Column({
    type: "enum",
    enum: InboxFolderName,
    default: InboxFolderName.INBOX,
  })
  folder: InboxFolderName;

  @Column({ name: "external_id", nullable: true })
  externalId: string;

  @Column({ name: "size_bytes", nullable: true })
  sizeBytes: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
