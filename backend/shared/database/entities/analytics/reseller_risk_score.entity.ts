import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("reseller_risk_scores")
export class ResellerRiskScore {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "reseller_id", type: "uuid" })
  @Index({ unique: true })
  resellerId: string;

  @Column({
    name: "aggregated_risk",
    type: "decimal",
    precision: 5,
    scale: 2,
    default: 0,
  })
  aggregatedRisk: number;

  @Column({ name: "high_risk_tenants", type: "integer", default: 0 })
  highRiskTenants: number;

  @Column({ name: "suspended_tenants", type: "integer", default: 0 })
  suspendedTenants: number;

  @Column({ name: "risk_level", type: "varchar", default: "safe" })
  riskLevel: string;

  @UpdateDateColumn({ name: "last_updated" })
  lastUpdated: Date;
}
