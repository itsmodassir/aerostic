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

export enum AgentType {
  CUSTOMER_SUPPORT = "customer_support",
  SALES = "sales",
  LEAD_FOLLOWUP = "lead_followup",
  FAQ = "faq",
  CUSTOM = "custom",
}

@Entity("ai_agents")
export class AiAgent {
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

  @Column({ nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: AgentType,
    default: AgentType.CUSTOMER_SUPPORT,
  })
  type: AgentType;

  // AI Configuration
  @Column({ name: "system_prompt", type: "text" })
  systemPrompt: string;

  @Column({ name: "welcome_message", nullable: true, type: "text" })
  welcomeMessage: string;

  @Column({ name: "fallback_message", nullable: true, type: "text" })
  fallbackMessage: string;

  @Column({
    name: "confidence_threshold",
    type: "decimal",
    precision: 3,
    scale: 2,
    default: 0.7,
  })
  confidenceThreshold: number;

  @Column({ name: "max_context_messages", default: 10 })
  maxContextMessages: number;

  // Model Settings
  @Column({ default: "gemini-pro" })
  model: string;

  @Column({ type: "decimal", precision: 2, scale: 1, default: 0.7 })
  temperature: number;

  @Column({ name: "max_tokens", default: 500 })
  maxTokens: number;

  // Behavior
  @Column({ name: "is_active", default: true })
  @Index()
  isActive: boolean;

  @Column({ name: "handoff_enabled", default: true })
  handoffEnabled: boolean;

  @Column({ name: "handoff_keywords", type: "simple-array", nullable: true })
  handoffKeywords: string[]; // ['agent', 'human', 'speak to someone']

  @Column({ name: "business_hours_only", default: false })
  businessHoursOnly: boolean;

  // Training Data (JSON)
  @Column({ name: "knowledge_base", type: "text", nullable: true })
  knowledgeBase: string; // JSON array of Q&A pairs

  @Column({ name: "sample_conversations", type: "text", nullable: true })
  sampleConversations: string; // JSON array

  // Analytics
  @Column({ name: "total_conversations", default: 0 })
  totalConversations: number;

  @Column({ name: "successful_resolutions", default: 0 })
  successfulResolutions: number;

  @Column({ name: "handoffs_triggered", default: 0 })
  handoffsTriggered: number;

  @Column({ name: "avg_response_time_ms", default: 0 })
  avgResponseTimeMs: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
