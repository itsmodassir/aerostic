import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AgentType {
    SALES = 'SALES',
    SUPPORT = 'SUPPORT',
    CUSTOM = 'CUSTOM',
}

export enum AgentTrigger {
    INCOMING_MESSAGE = 'INCOMING_MESSAGE',
    NEW_LEAD = 'NEW_LEAD',
    WEBHOOK = 'WEBHOOK',
}

@Entity('agents')
export class Agent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @Column()
    name: string;

    @Column({ type: 'enum', enum: AgentType, default: AgentType.CUSTOM })
    type: AgentType;

    @Column({ type: 'enum', enum: AgentTrigger, default: AgentTrigger.INCOMING_MESSAGE })
    trigger: AgentTrigger;

    @Column({ type: 'boolean', default: false })
    isActive: boolean;

    @Column('jsonb', { default: {} })
    flowConfig: any; // Stores the ReactFlow JSON configuration

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
