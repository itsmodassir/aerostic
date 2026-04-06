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
import { Campaign } from "./campaign.entity";

@Entity("campaign_triggers")
export class CampaignTrigger {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ name: "campaign_id", type: "uuid" })
  @Index()
  campaignId: string;

  @ManyToOne(() => Campaign, { onDelete: "CASCADE" })
  @JoinColumn({ name: "campaign_id" })
  campaign: Campaign;

  @Column()
  name: string;

  @Column({ name: "trigger_type", default: "webhook" })
  triggerType: string; // webhook, event

  @Column({ name: "api_key", nullable: true })
  @Index({ unique: true })
  apiKey: string; // Secret key for trigger URL: /api/campaigns/triggers/:apiKey

  @Column({ type: "jsonb", default: {} })
  mappingConfig: Record<string, string>; // Maps incoming payload keys to template variables

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
