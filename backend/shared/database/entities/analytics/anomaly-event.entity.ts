import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("anomaly_events")
export class AnomalyEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @Column({ name: "event_type" })
  @Index()
  eventType: string;
  // e.g., GEO_IP_DEVIATION, API_BURST, CREDIT_SPIKE, MASSIVE_DELETE

  @Column({ name: "risk_score_contribution", type: "integer" })
  riskScoreContribution: number;

  @Column({ type: "jsonb" })
  details: any;

  @Column({ default: false })
  resolved: boolean;

  @Column({ name: "resolved_at", nullable: true })
  resolvedAt: Date;

  @CreateDateColumn({ name: "created_at" })
  @Index()
  createdAt: Date;
}
