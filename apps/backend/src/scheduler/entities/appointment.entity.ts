import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Contact } from '../../contacts/entities/contact.entity';
import { User } from '../../users/entities/user.entity';

export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW',
}

@Entity('appointments')
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    @Index()
    tenantId: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    title: string;

    @Column({ name: 'start_time' })
    startTime: Date;

    @Column({ name: 'end_time' })
    endTime: Date;

    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.SCHEDULED,
    })
    status: AppointmentStatus;

    @Column({ name: 'meeting_link', nullable: true })
    meetingLink: string;

    @Column({ nullable: true, type: 'text' })
    notes: string;

    // Relations
    @Column({ name: 'contact_id', nullable: true, type: 'uuid' })
    contactId: string;

    @ManyToOne(() => Contact)
    @JoinColumn({ name: 'contact_id' })
    contact: Contact;

    @Column({ name: 'agent_id', nullable: true, type: 'uuid' })
    agentId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'agent_id' })
    agent: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
