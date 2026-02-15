import { MigrationInterface, QueryRunner } from "typeorm";

export class ResellerSchemaUpdate1771112710306 implements MigrationInterface {
    name = 'ResellerSchemaUpdate1771112710306'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create Plans Enum
        await queryRunner.query(`CREATE TYPE "public"."plans_type_enum" AS ENUM('regular', 'reseller')`);

        // 2. Add columns to Plans table
        await queryRunner.query(`ALTER TABLE "plans" ADD "type" "public"."plans_type_enum" NOT NULL DEFAULT 'regular'`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "max_sub_tenants" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "white_label_enabled" boolean NOT NULL DEFAULT false`);

        // 3. Create ResellerConfig table
        await queryRunner.query(`CREATE TABLE "reseller_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "domain" character varying, "logo" character varying, "favicon" character varying, "brand_name" character varying, "primary_color" character varying DEFAULT '#7C3AED', "theme" jsonb NOT NULL DEFAULT '{}', "support_email" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0276ac7600f534b8f67121d0ce3" UNIQUE ("tenant_id"), CONSTRAINT "UQ_f0f060e9c87fe0119ea22765a11" UNIQUE ("domain"), CONSTRAINT "PK_ec02bd3da24d436d0007fc732a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0276ac7600f534b8f67121d0ce" ON "reseller_configs" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f0f060e9c87fe0119ea22765a1" ON "reseller_configs" ("domain") `);

        // 4. Create Tenants Type Enum
        await queryRunner.query(`CREATE TYPE "public"."tenants_type_enum" AS ENUM('regular', 'reseller')`);

        // 5. Add columns to Tenants table
        await queryRunner.query(`ALTER TABLE "tenants" ADD "type" "public"."tenants_type_enum" NOT NULL DEFAULT 'regular'`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "reseller_id" uuid`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "reseller_credits" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "tenants"."reseller_credits" IS 'Credits allocated to reseller to distribute'`);

        // 6. Create Indexes
        await queryRunner.query(`CREATE INDEX "IDX_4844ba1239aa4270ee36240817" ON "tenants" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_e5124ab766ce9457e960cb4cf0" ON "tenants" ("reseller_id") `);

        // 7. Add Foreign Key Constraints
        await queryRunner.query(`ALTER TABLE "reseller_configs" ADD CONSTRAINT "FK_0276ac7600f534b8f67121d0ce3" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "FK_e5124ab766ce9457e960cb4cf08" FOREIGN KEY ("reseller_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert Changes
        await queryRunner.query(`ALTER TABLE "tenants" DROP CONSTRAINT "FK_e5124ab766ce9457e960cb4cf08"`);
        await queryRunner.query(`ALTER TABLE "reseller_configs" DROP CONSTRAINT "FK_0276ac7600f534b8f67121d0ce3"`);

        await queryRunner.query(`DROP INDEX "public"."IDX_e5124ab766ce9457e960cb4cf0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4844ba1239aa4270ee36240817"`);

        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "reseller_credits"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "reseller_id"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "type"`);

        await queryRunner.query(`DROP TYPE "public"."tenants_type_enum"`);

        await queryRunner.query(`DROP INDEX "public"."IDX_f0f060e9c87fe0119ea22765a1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0276ac7600f534b8f67121d0ce"`);
        await queryRunner.query(`DROP TABLE "reseller_configs"`);

        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "white_label_enabled"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "max_sub_tenants"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "type"`);

        await queryRunner.query(`DROP TYPE "public"."plans_type_enum"`);
    }
}
