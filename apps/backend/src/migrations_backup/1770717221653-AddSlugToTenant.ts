import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugToTenant1770717221653 implements MigrationInterface {
  name = 'AddSlugToTenant1770717221653';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add column as nullable first
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD "slug" character varying`,
    );

    // 2. Populate existing rows with a safe slug
    await queryRunner.query(
      `UPDATE "tenants" SET "slug" = lower(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g')) WHERE "slug" IS NULL`,
    );

    // 3. Set NOT NULL and UNIQUE constraints
    await queryRunner.query(
      `ALTER TABLE "tenants" ALTER COLUMN "slug" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD CONSTRAINT "UQ_2310ecc5cb8be427097154b18fc" UNIQUE ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2310ecc5cb8be427097154b18f" ON "tenants" ("slug") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2310ecc5cb8be427097154b18f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenants" DROP CONSTRAINT "UQ_2310ecc5cb8be427097154b18fc"`,
    );
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "slug"`);
  }
}
