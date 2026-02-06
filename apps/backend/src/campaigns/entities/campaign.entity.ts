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

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column()
  name: string;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string;

  @ManyToOne('Template', { nullable: true })
  @JoinColumn({ name: 'template_id' })
  template: any; // avoiding circular import issues for now, or import properly

  @Column({ name: 'scheduled_at', nullable: true })
  scheduledAt: Date;

  @Column({ default: 'draft' }) // draft, sending, completed
  status: string;

  @Column({ default: 0 })
  totalContacts: number;

  @Column({ default: 0 })
  sentCount: number;

  @Column({ default: 0 })
  failedCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
