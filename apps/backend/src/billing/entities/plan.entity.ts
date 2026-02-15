import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum PlanType {
    REGULAR = 'regular',
    RESELLER = 'reseller',
}

@Entity('plans')
export class Plan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'enum', enum: PlanType, default: PlanType.REGULAR })
    type: PlanType;

    @Column({ unique: true })
    @Index()
    slug: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    price: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0, name: 'setup_fee' })
    setupFee: number;

    @Column({ name: 'razorpay_plan_id', nullable: true })
    razorpayPlanId: string;

    @Column('jsonb', { default: {} })
    limits: {
        monthly_messages: number;
        ai_credits: number;
        max_agents: number;
        max_phone_numbers?: number;
        max_bots?: number;
        monthly_broadcasts?: number;
    };

    @Column({ name: 'max_sub_tenants', default: 0 })
    maxSubTenants: number;

    @Column({ name: 'white_label_enabled', default: false })
    whiteLabelEnabled: boolean;

    @Column('jsonb', { default: [] })
    features: string[]; // ['whatsapp_embedded', 'ai_features', 'whatsapp_marketing', 'templates', 'api_access', 'webhooks']

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
