import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("anomaly_vectors")
export class AnomalyVector {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id" })
  @Index()
  tenantId: string;

  @Column({ name: "api_key_id", nullable: true })
  apiKeyId: string;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  messageSpike: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  failureRatio: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  apiRate: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  geoEntropy: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  ipEntropy: number;

  @CreateDateColumn({ name: "timestamp" })
  @Index()
  timestamp: Date;
}
