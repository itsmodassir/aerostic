import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1770716335721 implements MigrationInterface {
    name = 'InitialSchema1770716335721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "UQ_a6bb67478aec10bf144870b91f8" UNIQUE ("meta_message_id")`);
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "confidence_threshold" SET DEFAULT '0.7'`);
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
        await queryRunner.query(`CREATE INDEX "IDX_a6bb67478aec10bf144870b91f" ON "messages" ("meta_message_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a6bb67478aec10bf144870b91f"`);
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "confidence_threshold" SET DEFAULT 0.7`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "UQ_a6bb67478aec10bf144870b91f8"`);
    }

}
