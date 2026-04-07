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
import { User } from "./user.entity";
import { Contact } from "./contact.entity";

export enum AutomationStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PAUSED = "paused",
}

export enum ExecutionStatus {
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
}

@Entity("automation_flows")
export class AutomationFlow {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  trigger: string; // e.g., 'message_received', 'keyword_detected'

  @Column({ type: "jsonb", default: {} })
  triggerConfig: any;

  @Column({
    type: "enum",
    enum: AutomationStatus,
    default: AutomationStatus.INACTIVE,
  })
  status: AutomationStatus;

  @Column({ default: 0 })
  executionCount: number;

  @Column({ nullable: true })
  lastExecutedAt: Date;

  @Column({ nullable: true })
  remoteId: string; // Meta Flow ID

  @Column({ type: "jsonb", nullable: true })
  categories: string[];

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @OneToMany(() => AutomationNode, (node) => node.automation)
  nodes: AutomationNode[];

  @OneToMany(() => AutomationEdge, (edge) => edge.automation)
  edges: AutomationEdge[];

  @OneToMany(() => AutomationExecution, (execution) => execution.automation)
  executions: AutomationExecution[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

@Entity("automation_nodes")
@Index(["automation", "nodeId"], { unique: true })
export class AutomationNode {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => AutomationFlow, (automation) => automation.nodes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "automation_id" })
  automation: AutomationFlow;

  @Column({ name: "node_id" })
  nodeId: string; // React Flow Node ID

  @Column()
  type: string; // trigger, action, condition, delay

  @Column({ nullable: true })
  subtype: string; // send_template, send_message, wait, etc.

  @Column({ type: "jsonb", default: {} })
  position: { x: number; y: number };

  @Column({ type: "jsonb", default: {} })
  measured: { width: number; height: number };

  @Column({ type: "jsonb", default: {} })
  data: any; // node config

  @Column({ type: "jsonb", default: [] })
  connections: string[]; // array of next nodeIds (redundant with edges but useful)

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

@Entity("automation_edges")
@Index(["automation", "sourceNodeId", "targetNodeId"], { unique: true })
export class AutomationEdge {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => AutomationFlow, (automation) => automation.edges, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "automation_id" })
  automation: AutomationFlow;

  @Column({ name: "edge_id", nullable: true })
  edgeId: string; // React Flow Edge ID

  @Column({ name: "source_node_id" })
  sourceNodeId: string;

  @Column({ name: "target_node_id" })
  targetNodeId: string;

  @Column({ default: false })
  animated: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

@Entity("automation_executions")
export class AutomationExecution {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => AutomationFlow, (automation) => automation.executions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "automation_id" })
  automation: AutomationFlow;

  @ManyToOne(() => Contact, { nullable: true })
  @JoinColumn({ name: "contact_id" })
  contact: Contact;

  @Column({ name: "conversation_id", nullable: true })
  conversationId: string;

  @Column({ type: "jsonb", default: {} })
  triggerData: any;

  @Column({
    type: "enum",
    enum: ExecutionStatus,
    default: ExecutionStatus.RUNNING,
  })
  status: ExecutionStatus;

  @Column({ name: "current_node_id", nullable: true })
  currentNodeId: string;

  @Column({ type: "jsonb", default: [] })
  executionPath: string[];

  @Column({ type: "jsonb", default: {} })
  variables: any;

  @Column({ type: "text", nullable: true })
  result: string;

  @Column({ type: "text", nullable: true })
  error: string;

  @CreateDateColumn({ name: "started_at" })
  startedAt: Date;

  @Column({ name: "completed_at", nullable: true })
  completedAt: Date;

  @OneToMany(() => AutomationExecutionLog, (log) => log.execution)
  logs: AutomationExecutionLog[];
}

@Entity("automation_execution_logs")
export class AutomationExecutionLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => AutomationExecution, (execution) => execution.logs, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "execution_id" })
  execution: AutomationExecution;

  @Column({ name: "node_id" })
  nodeId: string;

  @Column({ name: "node_type" })
  nodeType: string;

  @Column()
  status: string; // started, completed, failed

  @Column({ type: "jsonb", default: {} })
  input: any;

  @Column({ type: "jsonb", default: {} })
  output: any;

  @Column({ type: "text", nullable: true })
  error: string;

  @CreateDateColumn({ name: "executed_at" })
  executedAt: Date;
}
