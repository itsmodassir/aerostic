import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('whatsapp_accounts')
export class WhatsappAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    @Index()
    tenantId: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ name: 'waba_id' })
    wabaId: string;

    @Column({ name: 'phone_number_id', unique: true })
    @Index()
    phoneNumberId: string;

    @Column({ name: 'display_phone_number', nullable: true })
    displayPhoneNumber: string;

    @Column()
    mode: string; // 'cloud' | 'coexistence'

    @Column({ default: 'connected' })
    status: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
