import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { FlowExecution } from "./flow-execution.entity";

@Entity("flow_execution_logs")
export class FlowExecutionLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "execution_id", type: "uuid" })
  executionId: string;

  @ManyToOne(() => FlowExecution, (execution) => execution.logs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "execution_id" })
  execution: FlowExecution;

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
