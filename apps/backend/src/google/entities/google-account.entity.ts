import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('google_accounts')
export class GoogleAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @Column()
    email: string;

    @Column({ type: 'text' })
    accessToken: string; // Encrypted

    @Column({ type: 'text', nullable: true })
    refreshToken: string; // Encrypted

    @Column({ type: 'timestamp', nullable: true })
    tokenExpiresAt: Date;

    @Column({ type: 'simple-array', nullable: true })
    scopes: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
