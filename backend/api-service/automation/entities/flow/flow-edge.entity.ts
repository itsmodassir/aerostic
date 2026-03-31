import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { FlowAutomation } from "./flow-automation.entity";

@Entity("flow_edges")
@Unique(["automationId", "sourceNodeId", "targetNodeId"])
export class FlowEdge {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "automation_id", type: "uuid" })
  automationId: string;

  @ManyToOne(() => FlowAutomation, (automation) => automation.edges, { onDelete: "CASCADE" })
  @JoinColumn({ name: "automation_id" })
  automation: FlowAutomation;

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
