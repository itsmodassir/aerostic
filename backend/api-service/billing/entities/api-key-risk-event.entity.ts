import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { ApiKey } from "@shared/database/entities/core/api-key.entity";

export enum RiskType {
  RATE_SPIKE = "RATE_SPIKE",
  FAILURE_SPIKE = "FAILURE_SPIKE",
  AUTH_SPAM = "AUTH_SPAM",
  IP_ROTATION = "IP_ROTATION",
  AI_ML_SIGNAL = "AI_ML_SIGNAL",
  GEO_ANOMALY = "GEO_ANOMALY",
  MALICIOUS_IP = "MALICIOUS_IP",
  CROSS_TENANT_CLUSTER = "CROSS_TENANT_CLUSTER",
}

export enum RiskSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

@Entity("api_key_risk_events")
export class ApiKeyRiskEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "api_key_id", type: "uuid" })
  @Index()
  apiKeyId: string;

  @ManyToOne(() => ApiKey, { onDelete: "CASCADE" })
  @JoinColumn({ name: "api_key_id" })
  apiKey: ApiKey;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @Column({
    type: "enum",
    enum: RiskType,
  })
  riskType: RiskType;

  @Column({
    type: "enum",
    enum: RiskSeverity,
  })
  severity: RiskSeverity;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  score: number;

  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
