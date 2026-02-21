import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { RolePermission } from "./role-permission.entity";

@Entity("permissions")
@Index(["resource", "action"], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  resource: string; // campaigns, inbox, contacts, billing

  @Column()
  action: string; // create, read, update, delete, send

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[];
}
