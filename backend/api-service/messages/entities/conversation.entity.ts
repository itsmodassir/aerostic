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
import { Contact } from "../../contacts/entities/contact.entity";
import { User } from "@shared/database/entities/core/user.entity";

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

  @Column({ name: "phone_number_id" })
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

  @Column({ default: "open" })
  status: string;

  @Column({ name: "last_message_at", nullable: true })
  @Index()
  lastMessageAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
