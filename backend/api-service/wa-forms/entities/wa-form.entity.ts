import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Tenant } from "@shared/database/entities/core/tenant.entity";

export type WaFormStatus = "draft" | "published" | "archived";

@Entity("wa_forms")
export class WaForm {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ type: "varchar", length: 120 })
  name: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 20, default: "draft" })
  status: WaFormStatus;

  @Column({ name: "meta_flow_id", type: "varchar", length: 80, nullable: true })
  metaFlowId?: string | null;

  @Column({ name: "meta_flow_name", type: "varchar", length: 120, nullable: true })
  metaFlowName?: string | null;

  @Column({ name: "meta_categories", type: "simple-array", nullable: true })
  metaCategories?: string[];

  @Column({ name: "schema_json", type: "jsonb", default: {} })
  schemaJson: Record<string, any>;

  @Column({ name: "last_published_at", type: "timestamptz", nullable: true })
  lastPublishedAt?: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

