import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
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

    // Meta Business Info
    @Column({ name: 'business_id', nullable: true })
    businessId: string;

    @Column({ name: 'waba_id' })
    wabaId: string;

    @Column({ name: 'phone_number_id', unique: true })
    @Index()
    phoneNumberId: string;

    @Column({ name: 'display_phone_number', nullable: true })
    displayPhoneNumber: string;

    @Column({ name: 'verified_name', nullable: true })
    verifiedName: string;

    @Column({ name: 'quality_rating', nullable: true })
    qualityRating: string;

    // OAuth Tokens (encrypted in production)
    @Column({ name: 'access_token', nullable: true, type: 'text' })
    accessToken: string;

    @Column({ name: 'token_expires_at', nullable: true })
    tokenExpiresAt: Date;

    // Configuration
    @Column({ default: 'coexistence' })
    mode: string; // 'cloud' | 'coexistence' | 'onpremise'

    @Column({ default: 'pending' })
    @Index()
    status: string; // 'pending' | 'connected' | 'disconnected' | 'banned'

    @Column({ name: 'webhook_verified', default: false })
    webhookVerified: boolean;

    @Column({ name: 'messaging_limit', nullable: true })
    messagingLimit: string; // '1K' | '10K' | '100K' | 'UNLIMITED'

    // Metadata
    @Column({ name: 'last_synced_at', nullable: true })
    lastSyncedAt: Date;

    @Column({ name: 'message_count', default: 0 })
    messageCount: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

