import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from "typeorm";
import { Campaign } from "./campaign.entity";

@Entity("campaign_recipients")
export class CampaignRecipient {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "campaign_id", type: "uuid" })
  @Index()
  campaignId: string;

  @ManyToOne(() => Campaign, { onDelete: "CASCADE" })
  @JoinColumn({ name: "campaign_id" })
  campaign: Campaign;

  @Column({ name: "phone_number" })
  @Index()
  phoneNumber: string;

  @Column({ default: "pending" })
  status: string; // pending, sent, failed, read, delivered

  @Column({ name: "error_message", nullable: true })
  errorMessage: string;

  @Column({ name: "message_id", nullable: true })
  @Index()
  messageId: string; // Provider message ID (Meta)

  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
