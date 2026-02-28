import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum AgentType {
  SALES_UPPER = "SALES",
  SUPPORT_UPPER = "SUPPORT",
  CUSTOM_UPPER = "CUSTOM",
  CUSTOMER_SUPPORT = "customer_support",
  SALES = "sales",
  LEAD_FOLLOWUP = "lead_followup",
  FAQ = "faq",
  CUSTOM = "custom",
}

export enum AgentTrigger {
  INCOMING_MESSAGE = "INCOMING_MESSAGE",
  NEW_LEAD = "NEW_LEAD",
  WEBHOOK = "WEBHOOK",
}

@Entity("agents")
export class Agent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "text", nullable: true })
  systemPrompt: string;

  @Column({ type: "enum", enum: AgentType, default: AgentType.CUSTOM })
  type: AgentType;

  @Column({
    type: "enum",
    enum: AgentTrigger,
    default: AgentTrigger.INCOMING_MESSAGE,
  })
  trigger: AgentTrigger;

  @Column({ type: "boolean", default: false })
  isActive: boolean;

  @Column({ type: "int", default: 0 })
  totalConversations: number;

  @Column({ type: "int", default: 0 })
  successfulResolutions: number;

  @Column({ type: "int", default: 0 })
  handoffsTriggered: number;

  @Column("jsonb", { default: {} })
  flowConfig: any; // Stores the ReactFlow JSON configuration

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
