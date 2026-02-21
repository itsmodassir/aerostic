import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from "typeorm";

@Entity("system_daily_metrics")
@Unique(["date"])
@Index(["date"])
export class SystemDailyMetric {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "date" })
  date: string;

  @Column({ default: 0 })
  totalTenants: number;

  @Column({ default: 0 })
  activeTenants: number;

  @Column({ default: 0 })
  totalMessagesSent: number;

  @Column({ default: 0 })
  totalAiCreditsUsed: number;

  @Column("decimal", { precision: 15, scale: 2, default: 0 })
  totalRevenue: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
