import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum LogLevel {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error'
}

export enum LogCategory {
    SYSTEM = 'system',
    USER = 'user',
    SECURITY = 'security',
    BILLING = 'billing',
    WHATSAPP = 'whatsapp',
    AI = 'ai'
}

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

    @Column({
        type: 'enum',
        enum: LogLevel,
        default: LogLevel.INFO
    })
    level: LogLevel;

    @Column({
        type: 'enum',
        enum: LogCategory,
        default: LogCategory.SYSTEM
    })
    category: LogCategory;

    @Column({ nullable: true })
    source: string; // Service/module that generated the log

    @CreateDateColumn()
    timestamp: Date;
}
