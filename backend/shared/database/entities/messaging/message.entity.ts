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
import { Conversation } from "./conversation.entity";

@Entity("messages")
@Index(["conversationId", "createdAt"])
@Index(["tenantId", "createdAt"])
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ name: "conversation_id", type: "uuid", nullable: true })
  @Index()
  conversationId: string;

  @ManyToOne(() => Conversation, { onDelete: "CASCADE" })
  @JoinColumn({ name: "conversation_id" })
  conversation: Conversation;

  @Column({ name: "campaign_id", type: "uuid", nullable: true })
  @Index()
  campaignId: string;

  @Column()
  direction: string; // inbound, outbound

  @Column({ default: "text" })
  type: string; // text, image, document, template, interactive

  @Column({ type: "text", nullable: true })
  body: string;

  @Column({ type: "jsonb", nullable: true })
  content: any; // Used by api-service

  @Column({ name: "media_url", nullable: true })
  mediaUrl: string;

  @Column({ name: "provider_message_id", nullable: true })
  @Index()
  providerMessageId: string; // Meta message ID

  @Column({ name: "meta_message_id", nullable: true, unique: true })
  @Index()
  metaMessageId: string; // Alias for providerMessageId in api-service

  @Column({ default: "sent" })
  status: string; // sent, delivered, read, failed, received

  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @CreateDateColumn({ name: "created_at" })
  @Index()
  createdAt: Date;
}
