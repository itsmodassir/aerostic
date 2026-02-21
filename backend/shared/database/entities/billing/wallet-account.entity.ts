import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
    VersionColumn,
} from "typeorm";
import { Wallet } from "@shared/database/entities/billing/wallet.entity";

export enum WalletAccountType {
    MAIN_BALANCE = "main_balance",
    BONUS_CREDITS = "bonus_credits",
    ESCROW = "escrow",
    AI_CREDITS = "ai_credits",
}

@Entity("wallet_accounts")
@Index(["walletId", "type"], { unique: true })
export class WalletAccount {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: "wallet_id", type: "uuid" })
    walletId: string;

    @ManyToOne(() => Wallet, (wallet) => wallet.accounts, { onDelete: "CASCADE" })
    @JoinColumn({ name: "wallet_id" })
    wallet: Wallet;

    @Column({
        type: "enum",
        enum: WalletAccountType,
        default: WalletAccountType.MAIN_BALANCE,
    })
    type: WalletAccountType;

    @Column("decimal", { precision: 20, scale: 8, default: 0 })
    balance: number;

    @Column({ name: "last_transaction_id", type: "uuid", nullable: true })
    lastTransactionId: string;

    @VersionColumn()
    version: number;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}
