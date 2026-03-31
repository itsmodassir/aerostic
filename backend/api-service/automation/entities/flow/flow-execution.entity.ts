import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from "typeorm";
import { FlowAutomation } from "./flow-automation.entity";
import { Contact } from "@shared/database/entities/core/contact.entity";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { FlowExecutionLog } from "./flow-execution-log.entity";

@Entity("flow_executions")
export class FlowExecution {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ name: "automation_id", type: "uuid" })
  automationId: string;

  @ManyToOne(() => FlowAutomation, (automation) => automation.executions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "automation_id" })
  automation: FlowAutomation;

  @Column({ name: "contact_id", type: "uuid", nullable: true })
  contactId: string;

  @ManyToOne(() => Contact, { onDelete: "SET NULL" })
  @JoinColumn({ name: "contact_id" })
  contact: Contact;

  @Column({ name: "conversation_id", type: "uuid", nullable: true })
  conversationId: string;

  @Column({ name: "trigger_data", type: "jsonb", default: {} })
  triggerData: any;

  @Column()
  status: string; // running, completed, failed

  @Column({ name: "current_node_id", nullable: true })
  currentNodeId: string;

  @Column({ name: "execution_path", type: "jsonb", default: [] })
  executionPath: string[];

  @Column({ type: "jsonb", default: {} })
  variables: any;

  @Column({ type: "text", nullable: true })
  result: string;

  @Column({ type: "text", nullable: true })
  error: string;

  @OneToMany(() => FlowExecutionLog, (log) => log.execution)
  logs: FlowExecutionLog[];

  @CreateDateColumn({ name: "started_at" })
  startedAt: Date;

  @Column({ name: "completed_at", type: "timestamp", nullable: true })
  completedAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
