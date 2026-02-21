import { MigrationInterface, QueryRunner } from "typeorm";

export class EnterpriseWalletSystem1740192000000 implements MigrationInterface {
    name = "EnterpriseWalletSystem1740192000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Wallets table
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL UNIQUE,
        currency varchar(3) DEFAULT 'INR',
        status text DEFAULT 'active',
        metadata jsonb,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      )
    `);

        // 2. Wallet Accounts (multi-balance support)
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wallet_accounts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
        type text NOT NULL,
        balance numeric(20,8) DEFAULT 0,
        last_transaction_id uuid,
        version integer DEFAULT 1,
        updated_at timestamp with time zone DEFAULT now(),
        UNIQUE(wallet_id, type)
      )
    `);

        // 3. Partitioned Transactions table
        // Note: We drop existing if it was a regular table to recreate as partitioned
        await queryRunner.query(`DROP TABLE IF EXISTS wallet_transactions`);

        await queryRunner.query(`
      CREATE TABLE wallet_transactions (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL,
        wallet_account_id uuid NOT NULL REFERENCES wallet_accounts(id) ON DELETE CASCADE,
        type text NOT NULL,
        amount numeric(20,8) NOT NULL,
        balance_before numeric(20,8) NOT NULL,
        balance_after numeric(20,8) NOT NULL,
        reference_type text,
        reference_id text,
        idempotency_key text,
        description text,
        metadata jsonb,
        hash varchar(64),
        previous_transaction_id uuid,
        created_at timestamp with time zone DEFAULT now(),
        PRIMARY KEY (id, created_at)
      ) PARTITION BY RANGE (created_at)
    `);

        // 4. Create initial partitions for 2026
        const months = ["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        for (const month of months) {
            const currentMonthInt = parseInt(month);
            const nextMonthInt = currentMonthInt === 12 ? 1 : currentMonthInt + 1;
            const nextMonth = nextMonthInt.toString().padStart(2, "0");
            const year = "2026";
            const nextYear = currentMonthInt === 12 ? "2027" : "2026";

            await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS wallet_transactions_${year}_${month} PARTITION OF wallet_transactions
        FOR VALUES FROM ('${year}-${month}-01') TO ('${nextYear}-${nextMonth}-01')
      `);
        }

        // 5. Global unique index on idempotency_key (must include created_at for partitioned tables)
        await queryRunner.query(`
      CREATE UNIQUE INDEX idx_wallet_tx_idempotency ON wallet_transactions (idempotency_key, created_at)
    `);

        // 6. Index for faster lookups
        await queryRunner.query(`
      CREATE INDEX idx_wallet_tx_account_date ON wallet_transactions (wallet_account_id, created_at DESC)
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS wallet_transactions`);
        await queryRunner.query(`DROP TABLE IF EXISTS wallet_accounts`);
        await queryRunner.query(`DROP TABLE IF EXISTS wallets`);
    }
}
