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
import { Tenant } from "../core/tenant.entity";
import { Contact } from "../core/contact.entity";
import { User } from "../core/user.entity";

@Entity("conversations")
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ name: "phone_number_id", nullable: true })
  @Index()
  phoneNumberId: string;

  @Column({ name: "contact_id", type: "uuid", nullable: true })
  contactId: string;

  @ManyToOne(() => Contact)
  @JoinColumn({ name: "contact_id" })
  contact: Contact;

  @Column({ name: "assigned_agent", type: "uuid", nullable: true })
  assignedAgentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "assigned_agent" })
  assignedAgent: User;

  @Column({ name: "contact_name", nullable: true })
  contactName: string;

  @Column({ name: "phone_number", nullable: true })
  @Index()
  phoneNumber: string;

  @Column({ name: "last_message_at", nullable: true })
  @Index()
  lastMessageAt: Date;

  @Column({ name: "unread_count", default: 0 })
  unreadCount: number;

  @Column({ default: "open" })
  status: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
