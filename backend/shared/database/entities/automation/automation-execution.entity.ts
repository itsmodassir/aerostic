import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tenant } from "../core/tenant.entity";
import { Workflow } from "./workflow.entity";

@Entity("automation_executions")
@Index(["tenantId", "createdAt"])
export class AutomationExecution {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ name: "workflow_id", type: "uuid" })
  @Index()
  workflowId: string;

  @ManyToOne(() => Workflow, { onDelete: "SET NULL" })
  @JoinColumn({ name: "workflow_id" })
  workflow: Workflow;

  @Column()
  status: string; // 'running', 'completed', 'failed', 'timeout'

  @Column({ type: "jsonb", nullable: true })
  triggerData: any;

  @Column({ type: "jsonb", nullable: true })
  context: any; // Final state of variables/memory

  @Column({ type: "text", nullable: true })
  errorMessage: string;

  @Column({ name: "duration_ms", nullable: true })
  durationMs: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
