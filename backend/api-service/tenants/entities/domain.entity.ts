import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tenant } from "@shared/database/entities/core/tenant.entity";

@Entity("domains")
export class Domain {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ unique: true })
  @Index()
  hostname: string; // e.g., app.clientdomain.com

  @Column({ default: "active" })
  status: string; // active, pending_ssl, inactive

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ type: "jsonb", nullable: true })
  sslConfig: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
