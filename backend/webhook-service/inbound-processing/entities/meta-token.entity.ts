import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";
import { EncryptionTransformer } from "@shared/database/transformers/encryption.transformer";

@Entity("meta_tokens")
export class MetaToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "token_type", default: "system" })
  tokenType: string;

  @Column({
    name: "encrypted_token",
    transformer: new EncryptionTransformer(),
  })
  encryptedToken: string;

  @Column({ name: "expires_at", type: "timestamp", nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
