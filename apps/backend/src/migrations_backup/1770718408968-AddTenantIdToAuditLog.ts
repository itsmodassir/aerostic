import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTenantIdToAuditLog1770718408968 implements MigrationInterface {
    name = 'AddTenantIdToAuditLog1770718408968'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "tenant_id" character varying`);
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "confidence_threshold" SET DEFAULT '0.7'`);
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "confidence_threshold" SET DEFAULT 0.7`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "tenant_id"`);
    }

}
