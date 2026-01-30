import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    AGENT = 'agent',
}

@Entity('users')
export class User {
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

    @Column({ unique: true })
    email: string;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column({ type: 'enum', enum: UserRole })
    @Index()
    role: UserRole;

    // Profile
    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    avatar: string;

    // API Access
    @Column({ name: 'api_access_enabled', default: false })
    apiAccessEnabled: boolean;

    // Status
    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'email_verified', default: false })
    emailVerified: boolean;

    @Column({ name: 'last_login_at', nullable: true })
    lastLoginAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

