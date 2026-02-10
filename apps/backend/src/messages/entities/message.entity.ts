import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Conversation } from './conversation.entity';

@Entity('messages')
@Index(['conversationId', 'createdAt']) // Composite index for chat history pagination
@Index(['tenantId', 'createdAt']) // For analytics queries
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'conversation_id', type: 'uuid' })
  @Index()
  conversationId: string;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column()
  direction: string; // 'in' | 'out'

  @Column()
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  content: any;

  @Column({ nullable: true })
  status: string;

  @Column({ name: 'meta_message_id', nullable: true, unique: true })
  @Index()
  metaMessageId: string;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;
}
