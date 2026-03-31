import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToOne as BelongsTo,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { FlowAutomation } from "./flow-automation.entity";

@Entity("flow_nodes")
@Unique(["automationId", "nodeId"])
export class FlowNode {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "automation_id", type: "uuid" })
  automationId: string;

  @BelongsTo(() => FlowAutomation, (automation) => automation.nodes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "automation_id" })
  automation: FlowAutomation;

  @Column({ name: "node_id" })
  nodeId: string; // The ID from React Flow

  @Column()
  type: string; // trigger, action, condition, delay

  @Column({ nullable: true })
  subtype: string; // send_template, send_message, wait, etc.

  @Column({ type: "jsonb", default: {} })
  position: any; // {x, y}

  @Column({ type: "jsonb", default: {} })
  measured: any; // {x, y}

  @Column({ type: "jsonb", default: {} })
  data: any; // node config

  @Column({ type: "jsonb", default: [] })
  connections: string[]; // array of next nodeIds (redundant but matches Drizzle)

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
