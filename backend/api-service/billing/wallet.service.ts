import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, QueryRunner } from "typeorm";
import { Wallet, WalletStatus } from "@shared/database/entities/billing/wallet.entity";
import { WalletAccount, WalletAccountType } from "@shared/database/entities/billing/wallet-account.entity";
import { WalletTransaction, TransactionType } from "@shared/database/entities/billing/wallet-transaction.entity";
import { RedisService } from "@shared/redis.service";
import * as crypto from "crypto";

@Injectable()
export class WalletService {
    private readonly logger = new Logger(WalletService.name);

    constructor(
        @InjectRepository(Wallet)
        private walletRepo: Repository<Wallet>,
        @InjectRepository(WalletAccount)
        private accountRepo: Repository<WalletAccount>,
        @InjectRepository(WalletTransaction)
        private transactionRepo: Repository<WalletTransaction>,
        private redisService: RedisService,
        private dataSource: DataSource,
    ) { }

    /**
     * Ensure a tenant has a wallet and required accounts
     */
    async ensureWallet(tenantId: string): Promise<Wallet> {
        let wallet = await this.walletRepo.findOne({
            where: { tenantId },
            relations: ["accounts"],
        });

        if (!wallet) {
            wallet = await this.walletRepo.save(
                this.walletRepo.create({
                    tenantId,
                    status: WalletStatus.ACTIVE,
                }),
            );

            // Create default accounts
            const accountTypes = Object.values(WalletAccountType);
            const accounts = accountTypes.map((type) =>
                this.accountRepo.create({
                    walletId: wallet?.id || "",
                    type,
                    balance: 0,
                }),
            );
            wallet.accounts = await this.accountRepo.save(accounts);
        }

        return wallet;
    }

    /**
     * Get real-time balance (with Redis caching)
     */
    async getBalance(tenantId: string, type: WalletAccountType): Promise<number> {
        const cacheKey = `wallet:balance:${tenantId}:${type}`;
        const cached = await this.redisService.get(cacheKey);

        if (cached !== null) {
            return parseFloat(cached);
        }

        const wallet = await this.ensureWallet(tenantId);
        if (!wallet || !wallet.accounts) {
            throw new NotFoundException(`Wallet or accounts not found for tenant ${tenantId}`);
        }
        const account = wallet.accounts.find((a) => a.type === type);

        if (!account) throw new NotFoundException(`Account ${type} not found`);

        await this.redisService.set(cacheKey, account.balance.toString(), 300); // 5 min cache
        return parseFloat(account.balance.toString());
    }

    /**
     * Robust Transaction logic with ledger integrity
     */
    async processTransaction(
        tenantId: string,
        accountType: WalletAccountType,
        amount: number,
        type: TransactionType,
        params: {
            referenceType: string;
            referenceId: string;
            description?: string;
            idempotencyKey?: string;
            metadata?: any;
        }
    ): Promise<WalletTransaction> {
        if (amount <= 0) throw new BadRequestException("Amount must be positive");

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Check Idempotency
            if (params.idempotencyKey) {
                const existing = await queryRunner.manager.findOne(WalletTransaction, {
                    where: { idempotencyKey: params.idempotencyKey },
                });
                if (existing) {
                    await queryRunner.rollbackTransaction();
                    return existing;
                }
            }

            // 2. Get Account with Pessimistic Lock
            const wallet = await this.ensureWallet(tenantId);
            const account = await queryRunner.manager.findOne(WalletAccount, {
                where: { walletId: wallet.id, type: accountType },
                lock: { mode: "pessimistic_write" },
            });

            if (!account) throw new NotFoundException("Wallet account not found");

            const balanceBefore = parseFloat(account.balance.toString());
            let balanceAfter = balanceBefore;

            if (type === TransactionType.DEBIT) {
                if (balanceBefore < amount) {
                    throw new BadRequestException("Insufficient balance");
                }
                balanceAfter -= amount;
            } else {
                balanceAfter += amount;
            }

            // 3. Create Transaction Record
            const transaction = queryRunner.manager.create(WalletTransaction, {
                tenantId,
                walletAccountId: account.id,
                type,
                amount,
                balanceBefore,
                balanceAfter,
                referenceType: params.referenceType,
                referenceId: params.referenceId,
                idempotencyKey: params.idempotencyKey,
                description: params.description,
                metadata: params.metadata,
                previousTransactionId: account.lastTransactionId,
            });

            // 4. Generate Ledger Hash (Immutable Audit Trail)
            transaction.hash = this.generateTransactionHash(transaction);
            const savedTx = await queryRunner.manager.save(transaction);

            // 5. Update Account Balance
            account.balance = balanceAfter;
            account.lastTransactionId = savedTx.id;
            await queryRunner.manager.save(account);

            await queryRunner.commitTransaction();

            // 6. Async Cache Sync
            await this.redisService.set(`wallet:balance:${tenantId}:${accountType}`, balanceAfter.toString(), 300);

            return savedTx;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Transaction failed for tenant ${tenantId}`, err);
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    /**
   * Reseller allocates credits to a sub-tenant
   */
    async allocateResellerCredits(
        resellerId: string,
        subtenantId: string,
        amount: number,
        accountType: WalletAccountType = WalletAccountType.BONUS_CREDITS
    ): Promise<void> {
        // 1. Verify Hierarchy
        const subtenant = await this.dataSource.getRepository("Tenant").findOne({
            where: { id: subtenantId, resellerId },
        });
        if (!subtenant) {
            throw new BadRequestException("Tenant is not your sub-tenant");
        }

        const idempotencyKey = `reseller_alloc:${resellerId}:${subtenantId}:${Date.now()}`;

        // 2. Debit Reseller (Main or Bonus balance)
        await this.processTransaction(
            resellerId,
            accountType,
            amount,
            TransactionType.DEBIT,
            {
                referenceType: "RESELLER_ALLOCATION_OUT",
                referenceId: subtenantId,
                description: `Allocated ${amount} to sub-tenant ${subtenantId}`,
                idempotencyKey: `${idempotencyKey}:out`,
            }
        );

        // 3. Credit Sub-tenant
        await this.processTransaction(
            subtenantId,
            accountType,
            amount,
            TransactionType.CREDIT,
            {
                referenceType: "RESELLER_ALLOCATION_IN",
                referenceId: resellerId,
                description: `Received offline credits from Reseller`,
                idempotencyKey: `${idempotencyKey}:in`,
            }
        );
    }

    /**
     * Get transaction history for a tenant
     */
    async getTransactions(
        tenantId: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<[WalletTransaction[], number]> {
        return this.transactionRepo.findAndCount({
            where: { tenantId },
            order: { createdAt: "DESC" },
            take: limit,
            skip: offset,
        });
    }

    /**
     * Generate SHA-256 for ledger integrity
     */
    private generateTransactionHash(tx: WalletTransaction): string {
        const data = `${tx.walletAccountId}|${tx.amount}|${tx.balanceAfter}|${tx.previousTransactionId || 'genesis'}|${tx.idempotencyKey}`;
        return crypto.createHash("sha256").update(data).digest("hex");
    }
}
