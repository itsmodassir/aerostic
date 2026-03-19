import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("system_configs")
@Index(["key", "tenantId"], { unique: true })
export class SystemConfig {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  key: string;

  @Column({ type: "jsonb" })
  value: any;

  @Column({ name: "tenant_id", type: "uuid", nullable: true })
  tenantId: string | null; // null = global config

  @Column({ nullable: true })
  description: string;

  @Column({ default: false, name: "is_secret" })
  isSecret: boolean;

  @Column({ nullable: true })
  @Index()
  category: string;

  @Column({ name: "updated_by", nullable: true })
  updatedBy: string; // User ID of the admin who last changed it

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
