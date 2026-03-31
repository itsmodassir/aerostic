import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { User } from "@shared/database/entities/core/user.entity";
import { WhatsappAccount } from "../../../whatsapp/entities/whatsapp-account.entity";
import { FlowNode } from "./flow-node.entity";
import { FlowEdge } from "./flow-edge.entity";
import { FlowExecution } from "./flow-execution.entity";

@Entity("flow_automations")
export class FlowAutomation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ name: "channel_id", type: "uuid", nullable: true })
  channelId: string;

  @ManyToOne(() => WhatsappAccount, { onDelete: "CASCADE" })
  @JoinColumn({ name: "channel_id" })
  channel: WhatsappAccount;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column()
  trigger: string; // message_received, keyword, schedule, api_webhook

  @Column({ name: "trigger_config", type: "jsonb", default: {} })
  triggerConfig: any;

  @Column({ default: "inactive" })
  status: string; // active, inactive, paused

  @Column({ name: "execution_count", default: 0 })
  executionCount: number;

  @Column({ name: "last_executed_at", type: "timestamp", nullable: true })
  lastExecutedAt: Date;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdById: string;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @OneToMany(() => FlowNode, (node: FlowNode) => node.automation)
  nodes: FlowNode[];

  @OneToMany(() => FlowEdge, (edge: FlowEdge) => edge.automation)
  edges: FlowEdge[];

  @OneToMany(() => FlowExecution, (execution: FlowExecution) => execution.automation)
  executions: FlowExecution[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
