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

@Entity("tenant_behavior_profiles")
export class TenantBehaviorProfile {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index({ unique: true })
  tenantId: string;

  @OneToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  // Message Metrics (Rolling 30-day baseline)
  @Column({ name: "avg_messages_per_day", type: "float", default: 0 })
  avgMessagesPerDay: number;

  @Column({ name: "std_messages_per_day", type: "float", default: 0 })
  stdMessagesPerDay: number;

  // API Metrics
  @Column({ name: "avg_api_calls_per_hour", type: "float", default: 0 })
  avgApiCallsPerHour: number;

  @Column({ name: "std_api_calls_per_hour", type: "float", default: 0 })
  stdApiCallsPerHour: number;

  // Behavioral Norms
  @Column({ type: "jsonb", name: "usual_countries", default: [] })
  usualCountries: string[];

  @Column({ type: "jsonb", name: "usual_active_hours", default: [] })
  usualActiveHours: number[]; // 0-23

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
