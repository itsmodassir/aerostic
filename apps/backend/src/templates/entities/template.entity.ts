import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, UpdateDateColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('templates')
export class Template {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    @Index()
    tenantId: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    name: string; // The systematic name (e.g. 'hello_world')

    @Column({ nullable: true })
    language: string; // e.g. 'en_US'

    @Column()
    status: string; // APPROVED, REJECTED, PENDING

    @Column({ type: 'jsonb', nullable: true })
    components: any; // Body text, buttons, etc.

    @Column({ nullable: true })
    category: string; // MARKETING, UTILITY

    @UpdateDateColumn()
    lastSyncedAt: Date;
}
