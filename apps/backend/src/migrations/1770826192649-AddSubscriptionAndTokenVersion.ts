import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionAndTokenVersion1770826192649 implements MigrationInterface {
    name = 'AddSubscriptionAndTokenVersion1770826192649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "razorpay_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventId" character varying NOT NULL, "event" character varying NOT NULL, "payload" jsonb, "status" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0dc0a37e70cdb3c89a2160e79d3" UNIQUE ("eventId"), CONSTRAINT "PK_ea319a2de13baf2804ef8112df9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0dc0a37e70cdb3c89a2160e79d" ON "razorpay_events" ("eventId") `);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "trial_ends_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "token_version" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "subscription_status" SET DEFAULT 'trialing'`);
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "confidence_threshold" SET DEFAULT '0.7'`);
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "confidence_threshold" SET DEFAULT 0.7`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "subscription_status" SET DEFAULT 'trial'`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "token_version"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "trial_ends_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0dc0a37e70cdb3c89a2160e79d"`);
        await queryRunner.query(`DROP TABLE "razorpay_events"`);
    }

}
