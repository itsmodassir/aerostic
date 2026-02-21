import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { ApiKey } from "../core/api-key.entity";

@Entity("api_key_usage")
export class ApiKeyUsage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "api_key_id", type: "uuid" })
  @Index()
  apiKeyId: string;

  @ManyToOne(() => ApiKey, { onDelete: "CASCADE" })
  @JoinColumn({ name: "api_key_id" })
  apiKey: ApiKey;

  @Column()
  endpoint: string;

  @Column()
  method: string;

  @Column({ name: "ip_address", nullable: true })
  ipAddress: string;

  @Column({ name: "status_code" })
  statusCode: number;

  @Column({ name: "response_time_ms" })
  responseTimeMs: number;

  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @CreateDateColumn({ name: "created_at" })
  @Index()
  createdAt: Date;
}
