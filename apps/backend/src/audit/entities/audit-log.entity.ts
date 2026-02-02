import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    actorId: string; // User ID who performed the action

    @Column()
    actorName: string; // Name or email for display

    @Column()
    action: string; // e.g., 'UPDATE_CONFIG', 'DELETE_TENANT'

    @Column()
    target: string; // e.g., 'System Config', 'Tenant: Aimstors'

    @Column('jsonb', { nullable: true })
    metadata: any; // Changed values, details

    @Column({ nullable: true })
    ipAddress: string;

    @CreateDateColumn()
    timestamp: Date;
}
