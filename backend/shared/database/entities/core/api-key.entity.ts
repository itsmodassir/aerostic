import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Tenant } from "./tenant.entity";

@Entity("api_keys")
export class ApiKey {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column()
  name: string;

  @Column({ name: "key_prefix" })
  @Index()
  keyPrefix: string; // 'ask_live_...' or 'ask_test_...' prefix

  @Column({ name: "key_hash" })
  keyHash: string; // SHA-256 hash of the full key

  @Column({ type: "jsonb", default: [] })
  permissions: string[]; // ['messages:read', 'messages:write']

  @Column({ type: "varchar", length: 10, default: "live" })
  environment: "live" | "test";

  @Column({ name: "rate_limit_per_minute", default: 100 })
  rateLimitPerMinute: number;

  @Column({ name: "rate_limit_per_day", default: 10000 })
  rateLimitPerDay: number;

  @Column({ name: "allowed_ips", type: "jsonb", nullable: true })
  allowedIps: string[];

  @Column({
    name: "risk_score",
    type: "decimal",
    precision: 5,
    scale: 2,
    default: 0,
  })
  @Index()
  riskScore: number;

  @Column({ name: "kill_switch_active", default: false })
  @Index()
  killSwitchActive: boolean;

  @Column({ name: "kill_reason", type: "text", nullable: true })
  killReason: string | null;

  @Column({ name: "rate_limit", default: 100 })
  rateLimit: number;

  @Column({ name: "requests_today", default: 0 })
  requestsToday: number;

  @Column({ name: "last_risk_event", type: "timestamptz", nullable: true })
  lastRiskEvent: Date | null;

  @Column({ name: "is_active", default: true })
  @Index()
  isActive: boolean;

  @Column({ name: "last_used_at", nullable: true })
  lastUsedAt: Date;

  @Column({ name: "expires_at", nullable: true })
  @Index()
  expiresAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
