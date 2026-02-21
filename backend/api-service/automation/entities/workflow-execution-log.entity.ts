import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { WorkflowExecution } from "./workflow-execution.entity";

export enum NodeExecutionStatus {
  STARTED = "started",
  COMPLETED = "completed",
  FAILED = "failed",
  SKIPPED = "skipped",
}

@Entity("workflow_execution_logs")
export class WorkflowExecutionLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "execution_id", type: "uuid" })
  @Index()
  executionId: string;

  @ManyToOne(() => WorkflowExecution, (execution) => execution.logs, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "execution_id" })
  execution: WorkflowExecution;

  @Column({ name: "node_id" })
  nodeId: string;

  @Column({ name: "node_type" })
  nodeType: string;

  @Column({
    type: "enum",
    enum: NodeExecutionStatus,
    default: NodeExecutionStatus.STARTED,
  })
  status: NodeExecutionStatus;

  @Column({ type: "jsonb", nullable: true })
  input: any;

  @Column({ type: "jsonb", nullable: true })
  output: any;

  @Column({ type: "text", nullable: true })
  error: string;

  @Column({ name: "duration_ms", nullable: true })
  durationMs: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
