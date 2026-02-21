import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    OneToOne,
    JoinColumn,
    OneToMany,
} from "typeorm";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { WalletAccount } from "@shared/database/entities/billing/wallet-account.entity";

export enum WalletStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    LOCKED = "locked",
}

@Entity("wallets")
export class Wallet {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: "tenant_id", type: "uuid", unique: true })
    @Index()
    tenantId: string;

    @OneToOne(() => Tenant, { onDelete: "CASCADE" })
    @JoinColumn({ name: "tenant_id" })
    tenant: Tenant;

    @Column({ default: "INR" })
    currency: string;

    @Column({
        type: "enum",
        enum: WalletStatus,
        default: WalletStatus.ACTIVE,
    })
    status: WalletStatus;

    @OneToMany(() => WalletAccount, (account: WalletAccount) => account.wallet)
    accounts: WalletAccount[];

    @Column({ type: "jsonb", nullable: true })
    metadata: any;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}
