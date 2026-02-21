import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("platform_risk_snapshots")
export class PlatformRiskSnapshot {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "overall_score", type: "decimal", precision: 5, scale: 2 })
  overallScore: number;

  @Column({ name: "high_risk_tenants", type: "integer" })
  highRiskTenants: number;

  @Column({ name: "suspended_api_keys", type: "integer" })
  suspendedApiKeys: number;

  @Column({ name: "anomaly_clusters", type: "integer" })
  anomalyClusters: number;

  @Column({
    name: "attack_intensity",
    type: "decimal",
    precision: 5,
    scale: 2,
    default: 0,
  })
  attackIntensity: number; // % increase/decrease in anomaly events

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
