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
import { Tenant } from "@shared/database/entities/core/tenant.entity";

@Entity("workflow_memory")
@Index(["tenantId", "contactId", "key"], { unique: true })
export class WorkflowMemory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ name: "contact_id", type: "uuid", nullable: true })
  @Index()
  contactId: string;

  @Column()
  key: string;

  @Column({ type: "jsonb" })
  value: any;

  @Column({ name: "expires_at", type: "timestamp", nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
