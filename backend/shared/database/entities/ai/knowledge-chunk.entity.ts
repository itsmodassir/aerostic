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
import { KnowledgeBase } from "./knowledge-base.entity";

@Entity("knowledge_chunks")
export class KnowledgeChunk {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "knowledge_base_id", type: "uuid" })
  @Index()
  knowledgeBaseId: string;

  @ManyToOne(() => KnowledgeBase, (kb) => kb.chunks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "knowledge_base_id" })
  knowledgeBase: KnowledgeBase;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "jsonb" })
  embedding: number[];

  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
