import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from "typeorm";
import { User } from "@shared/database/entities/core/user.entity";
import { Tenant } from "@shared/database/entities/core/tenant.entity";

@Entity("user_sessions")
@Index(["userId"])
@Index(["tenantId"])
@Index(["refreshTokenHash"])
@Index(["expiresAt"])
export class UserSession {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @Column({ name: "refresh_token_hash" })
  refreshTokenHash: string;

  @Column({ name: "ip_address", nullable: true })
  ipAddress: string;

  @Column({ name: "user_agent", type: "text", nullable: true })
  userAgent: string;

  @Column({ name: "expires_at" })
  expiresAt: Date;

  @Column({ name: "revoked_at", nullable: true })
  revokedAt: Date;

  @Column({ name: "is_impersonation", default: false })
  isImpersonation: boolean;

  @Column({ name: "impersonated_by", nullable: true })
  impersonatedBy: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
