import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Tenant } from "../core/tenant.entity";

export enum RiskStatus {
  NORMAL = "normal",
  WARNING = "warning",
  HIGH_RISK = "high_risk",
  CRITICAL = "critical",
}

@Entity("tenant_risk_scores")
export class TenantRiskScore {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index({ unique: true })
  tenantId: string;

  @OneToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ name: "current_score", type: "integer", default: 0 })
  currentScore: number;

  @Column({
    type: "enum",
    enum: RiskStatus,
    default: RiskStatus.NORMAL,
  })
  status: RiskStatus;

  @Column({ name: "last_incident_at", nullable: true })
  lastIncidentAt: Date;

  @Column({ name: "anomaly_count_last_hour", type: "integer", default: 0 })
  anomalyCountLastHour: number;

  @UpdateDateColumn({ name: "last_updated" })
  lastUpdated: Date;
}
