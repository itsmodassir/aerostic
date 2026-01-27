import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('ai_agents')
export class AiAgent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    @Index()
    tenantId: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ nullable: true })
    name: string;

    @Column({ default: true })
    active: boolean;

    @Column({ name: 'system_prompt', type: 'text', nullable: true })
    systemPrompt: string; // The "Persona"

    @Column({ name: 'confidence_threshold', default: 70 })
    confidenceThreshold: number;
}
