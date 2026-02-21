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

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  USER = "user",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: "token_version", default: 0 })
  tokenVersion: number;

  @Column({ name: "password_hash" })
  passwordHash: string;

  @Column({ type: "enum", enum: UserRole })
  @Index()
  role: UserRole;

  // Profile
  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  // API Access
  @Column({ name: "api_access_enabled", default: false })
  apiAccessEnabled: boolean;

  @Column({ type: "jsonb", default: [] })
  permissions: string[]; // Granular permissions for human users

  // Status
  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @Column({ name: "email_verified", default: false })
  emailVerified: boolean;

  @Column({ name: "last_login_at", nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
