import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import {
  AuthzResource,
  AuthzAction,
} from "../../../authorization/constants/authz.constants";

@Entity("policies")
@Index(["subjectType", "subject"])
export class PolicyEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  subjectType: "role" | "user" | "api_key";

  @Column()
  subject: string; // e.g. 'workspace_admin', 'user_uuid', 'key_uuid'

  @Column()
  resource: string; // 'campaign', 'message', '*'

  @Column("simple-array")
  actions: string[]; // ['read', 'execute', '*']

  @Column("jsonb", { nullable: true })
  conditions: {
    subscriptionStatus?: string;
    minRiskScore?: number;
    businessHoursOnly?: boolean;
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
