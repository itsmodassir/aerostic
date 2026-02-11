import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTenantMembership1770717669198 implements MigrationInterface {
    name = 'CreateTenantMembership1770717669198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_109638590074998bb72a2f2cf08"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_109638590074998bb72a2f2cf0"`);
        await queryRunner.query(`CREATE TYPE "public"."tenant_memberships_role_enum" AS ENUM('owner', 'admin', 'agent', 'viewer')`);
        await queryRunner.query(`CREATE TABLE "tenant_memberships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, "role" "public"."tenant_memberships_role_enum" NOT NULL DEFAULT 'agent', "status" character varying NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f0363260d50178a78654f4a59f6" UNIQUE ("user_id", "tenant_id"), CONSTRAINT "PK_706d16104745b32d75df5836135" PRIMARY KEY ("id"))`);

        // --- DATA MIGRATION START ---
        // Migrate existing user memberships before dropping the columns
        await queryRunner.query(`
            INSERT INTO "tenant_memberships" ("user_id", "tenant_id", "role", "status")
            SELECT "id", "tenant_id", 
                   CASE 
                     WHEN "role"::text = 'admin' THEN 'owner'::"public"."tenant_memberships_role_enum"
                     WHEN "role"::text = 'agent' THEN 'agent'::"public"."tenant_memberships_role_enum"
                     ELSE 'owner'::"public"."tenant_memberships_role_enum" 
                   END,
                   'active'
            FROM "users"
            WHERE "tenant_id" IS NOT NULL
        `);
        // --- DATA MIGRATION END ---

        await queryRunner.query(`CREATE INDEX "IDX_7427b391abdef33b40124c1582" ON "tenant_memberships" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d22937ebccd641b5090849e51f" ON "tenant_memberships" ("tenant_id") `);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tenant_id"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'user')`);

        // Update users role to 'user' unless they were super_admin
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING 
            CASE 
                WHEN "role"::text = 'super_admin' THEN 'super_admin'::"public"."users_role_enum"
                ELSE 'user'::"public"."users_role_enum"
            END`);

        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tenant_memberships" ADD CONSTRAINT "FK_7427b391abdef33b40124c15822" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant_memberships" ADD CONSTRAINT "FK_d22937ebccd641b5090849e51f7" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant_memberships" DROP CONSTRAINT "FK_d22937ebccd641b5090849e51f7"`);
        await queryRunner.query(`ALTER TABLE "tenant_memberships" DROP CONSTRAINT "FK_7427b391abdef33b40124c15822"`);
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`ALTER TABLE "ai_agents" ALTER COLUMN "confidence_threshold" SET DEFAULT 0.7`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('super_admin', 'admin', 'agent')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "tenant_id" uuid NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d22937ebccd641b5090849e51f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7427b391abdef33b40124c1582"`);
        await queryRunner.query(`DROP TABLE "tenant_memberships"`);
        await queryRunner.query(`DROP TYPE "public"."tenant_memberships_role_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_109638590074998bb72a2f2cf0" ON "users" ("tenant_id") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_109638590074998bb72a2f2cf08" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
