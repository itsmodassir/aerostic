import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('webhook_endpoints')
export class WebhookEndpoint {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    @Index()
    tenantId: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    url: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    secret: string; // For signature verification

    @Column('simple-array')
    events: string[]; // ['message.received', 'message.sent', 'lead.created', 'campaign.completed']

    @Column({ name: 'is_active', default: true })
    @Index()
    isActive: boolean;

    @Column({ name: 'last_triggered_at', nullable: true })
    lastTriggeredAt: Date;

    @Column({ name: 'failure_count', default: 0 })
    failureCount: number;

    @Column({ name: 'last_failure_at', nullable: true })
    lastFailureAt: Date;

    @Column({ name: 'last_failure_reason', nullable: true })
    lastFailureReason: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
