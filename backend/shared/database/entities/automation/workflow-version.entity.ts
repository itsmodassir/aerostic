import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Workflow } from "./workflow.entity";

@Entity("workflow_versions")
export class WorkflowVersion {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "workflow_id", type: "uuid" })
  @Index()
  workflowId: string;

  @ManyToOne(() => Workflow, { onDelete: "CASCADE" })
  @JoinColumn({ name: "workflow_id" })
  workflow: Workflow;

  @Column()
  version: number;

  @Column({ type: "jsonb" })
  nodes: any[];

  @Column({ type: "jsonb" })
  edges: any[];

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
