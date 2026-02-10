import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Role } from './role.entity';

export enum TenantRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    AGENT = 'agent',
    VIEWER = 'viewer',
}

@Entity('tenant_memberships')
@Unique(['userId', 'tenantId'])
export class TenantMembership {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'tenant_id', type: 'uuid' })
    @Index()
    tenantId: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ name: 'role_id', type: 'uuid', nullable: true })
    roleId: string;

    @ManyToOne(() => Role, (role) => role.memberships)
    @JoinColumn({ name: 'role_id' })
    roleEntity: Role;

    @Column({
        type: 'enum',
        enum: TenantRole,
        default: TenantRole.AGENT,
    })
    role: TenantRole; // Kept temporarily for migration

    @Column({ default: 'active' })
    status: string; // active, invited, suspended

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
