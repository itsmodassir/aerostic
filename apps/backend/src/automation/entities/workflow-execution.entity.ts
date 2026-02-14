import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    OneToMany,
} from 'typeorm';
import { Workflow } from './workflow.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { WorkflowExecutionLog } from './workflow-execution-log.entity';

export enum ExecutionStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
    PARTIAL = 'partial',
}

@Entity('workflow_executions')
export class WorkflowExecution {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'workflow_id', type: 'uuid' })
    @Index()
    workflowId: string;

    @ManyToOne(() => Workflow, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workflow_id' })
    workflow: Workflow;

    @Column({ name: 'tenant_id', type: 'uuid' })
    @Index()
    tenantId: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({
        type: 'enum',
        enum: ExecutionStatus,
        default: ExecutionStatus.PENDING,
    })
    status: ExecutionStatus;

    @Column({ name: 'trigger_source', nullable: true })
    triggerSource: string;

    @Column({ type: 'jsonb', nullable: true })
    context: any;

    @Column({ type: 'text', nullable: true })
    error: string;

    @Column({ name: 'started_at', nullable: true })
    startedAt: Date;

    @Column({ name: 'completed_at', nullable: true })
    completedAt: Date;

    @OneToMany(() => WorkflowExecutionLog, (log) => log.execution)
    logs: WorkflowExecutionLog[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
