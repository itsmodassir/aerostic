import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "actor_type" })
  @Index()
  actorType: "user" | "admin" | "system" | "api_key";

  @Column({ name: "actor_id", nullable: true })
  @Index()
  actorId: string;

  @Column()
  @Index()
  action: string;
  // e.g., CREATE_TENANT, LOGIN_SUCCESS, CONFIG_UPDATE

  @Column({ name: "resource_type" })
  @Index()
  resourceType: string;

  @Column({ name: "resource_id", nullable: true })
  @Index()
  resourceId: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @Column({ name: "ip_address" })
  ipAddress: string;

  @Column({ name: "user_agent" })
  userAgent: string;

  @Column({ name: "tenant_id" })
  @Index()
  tenantId: string;

  @Column()
  hash: string; // SHA-256(previousHash + JSON.stringify(logData))

  @Column({ name: "previous_hash", nullable: true })
  previousHash: string;

  @CreateDateColumn({ name: "created_at" })
  @Index()
  createdAt: Date;
}
