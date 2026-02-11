import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum InboxFolderName {
  INBOX = 'inbox',
  SENT = 'sent',
  ARCHIVE = 'archive',
  SPAM = 'spam',
}

@Entity('email_messages')
export class EmailMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  mailbox: string; // e.g., 'support', 'sales', 'info'

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  subject: string;

  @Column('text')
  content: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({
    type: 'enum',
    enum: InboxFolderName,
    default: InboxFolderName.INBOX,
  })
  folder: InboxFolderName;

  @Column({ name: 'external_id', nullable: true })
  externalId: string; // ID from external provider if any

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
