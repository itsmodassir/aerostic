import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Tenant } from "./tenant.entity";

@Entity("reseller_configs")
export class ResellerConfig {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid", unique: true })
  @Index()
  tenantId: string;

  @OneToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ unique: true, nullable: true })
  @Index()
  domain: string; // e.g., partner.aimstore.in

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  favicon: string;

  @Column({ name: "brand_name", nullable: true })
  brandName: string;

  @Column({ name: "primary_color", nullable: true, default: "#7C3AED" })
  primaryColor: string; // Default Violet/Purple

  @Column({ type: "jsonb", default: {} })
  theme: Record<string, any>; // Store custom UI tokens/detailed theme config

  @Column({ name: "support_email", nullable: true })
  supportEmail: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
