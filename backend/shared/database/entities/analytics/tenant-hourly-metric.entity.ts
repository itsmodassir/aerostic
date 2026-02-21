import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from "typeorm";

@Entity("tenant_hourly_metrics")
@Index(["tenantId", "hourBucket"], { unique: true })
export class TenantHourlyMetric {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @Column({ name: "hour_bucket", type: "timestamp" })
  @Index()
  hourBucket: Date; // Truncated to the start of the hour

  @Column({ name: "messages_sent", type: "integer", default: 0 })
  messagesSent: number;

  @Column({ name: "messages_failed", type: "integer", default: 0 })
  messagesFailed: number;

  @Column({ name: "api_calls", type: "integer", default: 0 })
  apiCalls: number;

  @Column({ name: "distinct_ips", type: "integer", default: 0 })
  distinctIps: number;

  @Column({
    name: "failed_ratio",
    type: "decimal",
    precision: 5,
    scale: 2,
    default: 0,
  })
  failedRatio: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
