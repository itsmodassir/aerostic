import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRiskAnalyticsTables1740268800000 implements MigrationInterface {
    name = "CreateRiskAnalyticsTables1740268800000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. tenant_risk_scores table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS tenant_risk_scores (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id uuid NOT NULL UNIQUE,
                current_score integer DEFAULT 0,
                status varchar(20) DEFAULT 'normal',
                last_incident_at timestamp with time zone,
                anomaly_count_last_hour integer DEFAULT 0,
                last_updated timestamp with time zone DEFAULT now(),
                CONSTRAINT fk_tenant_risk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
            )
        `);

        // 2. platform_risk_snapshots table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS platform_risk_snapshots (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                overall_score decimal(5,2) NOT NULL,
                high_risk_tenants integer NOT NULL,
                suspended_api_keys integer NOT NULL,
                anomaly_clusters integer NOT NULL,
                attack_intensity decimal(5,2) DEFAULT 0.00,
                created_at timestamp with time zone DEFAULT now()
            )
        `);

        // 3. reseller_risk_scores table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS reseller_risk_scores (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                reseller_id uuid NOT NULL UNIQUE,
                aggregated_risk decimal(5,2) DEFAULT 0.00,
                high_risk_tenants integer DEFAULT 0,
                suspended_tenants integer DEFAULT 0,
                risk_level varchar(20) DEFAULT 'safe',
                last_updated timestamp with time zone DEFAULT now()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS reseller_risk_scores`);
        await queryRunner.query(`DROP TABLE IF EXISTS platform_risk_snapshots`);
        await queryRunner.query(`DROP TABLE IF EXISTS tenant_risk_scores`);
    }
}
