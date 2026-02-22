import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRLAnalyticsTables1740192000001 implements MigrationInterface {
    name = "AddRLAnalyticsTables1740192000001";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. RL Policies table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS rl_policies (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                policy_name varchar(255) NOT NULL UNIQUE,
                current_threshold decimal(5,2) DEFAULT 80.00,
                exploration_rate decimal(3,2) DEFAULT 0.10,
                learning_rate decimal(3,2) DEFAULT 0.05,
                last_updated timestamp with time zone DEFAULT now()
            )
        `);

        // 2. RL Experiences table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS rl_experiences (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                state jsonb NOT NULL,
                action integer NOT NULL,
                reward decimal(5,2),
                is_processed boolean DEFAULT false,
                created_at timestamp with time zone DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE INDEX idx_rl_experiences_processed ON rl_experiences (is_processed)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_rl_experiences_processed`);
        await queryRunner.query(`DROP TABLE IF EXISTS rl_experiences`);
        await queryRunner.query(`DROP TABLE IF EXISTS rl_policies`);
    }
}
