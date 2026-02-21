import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

export enum ClusterRiskLevel {
  WARNING = "warning",
  HIGH = "high",
  CRITICAL = "critical",
}

@Entity("platform_anomaly_clusters")
export class PlatformAnomalyCluster {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "cluster_signature" })
  @Index()
  clusterSignature: string; // e.g., 'coordinated_spike_template_45'

  @Column({ name: "affected_tenants", type: "integer" })
  affectedTenantCount: number;

  @Column({
    type: "enum",
    enum: ClusterRiskLevel,
    default: ClusterRiskLevel.WARNING,
  })
  riskLevel: ClusterRiskLevel;

  @Column({ type: "jsonb", default: {} })
  metadata: Record<string, any>; // Stores tenant IDs, common headers, IPs, etc.

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
