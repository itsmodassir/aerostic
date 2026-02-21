import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from "typeorm";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { KnowledgeChunk } from "./knowledge-chunk.entity";

@Entity("knowledge_bases")
export class KnowledgeBase {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column()
  name: string;

  @Column({ nullable: true, type: "text" })
  description: string;

  @OneToMany(() => KnowledgeChunk, (chunk) => chunk.knowledgeBase)
  chunks: KnowledgeChunk[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
