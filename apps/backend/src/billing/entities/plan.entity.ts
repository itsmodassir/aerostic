import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('plans')
export class Plan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    @Index()
    slug: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    price: number;

    @Column('jsonb', { default: {} })
    limits: {
        monthly_messages: number;
        ai_credits: number;
        max_agents: number;
    };

    @Column('jsonb', { default: [] })
    features: string[]; // ['whatsapp_embedded', 'ai_features', 'whatsapp_marketing', 'templates', 'api_access', 'webhooks']

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
