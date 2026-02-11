import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGranularPermissions1770718119900 implements MigrationInterface {
  name = 'CreateGranularPermissions1770718119900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "resource" character varying NOT NULL, "action" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_7331684c0c5b063803a425001a" ON "permissions" ("resource", "action") `,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_memberships" ADD "role_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_agents" ALTER COLUMN "confidence_threshold" SET DEFAULT '0.7'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_agents" ALTER COLUMN "temperature" SET DEFAULT '0.7'`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_memberships" ADD CONSTRAINT "FK_fa9ba14be22683296a780a57c6f" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // --- SEED DATA START ---

    // 1. Insert permissions
    await queryRunner.query(`
            INSERT INTO "permissions" ("resource", "action", "description") VALUES
            ('campaigns', 'create', 'Create campaigns'),
            ('campaigns', 'read', 'View campaigns'),
            ('campaigns', 'send', 'Send campaigns'),
            ('campaigns', 'delete', 'Delete campaigns'),
            ('inbox', 'read', 'Read inbox messages'),
            ('inbox', 'reply', 'Reply to messages'),
            ('contacts', 'read', 'View contacts'),
            ('contacts', 'import', 'Import contacts'),
            ('automation', 'create', 'Create automations'),
            ('automation', 'update', 'Edit automations'),
            ('analytics', 'read', 'View analytics'),
            ('billing', 'manage', 'Manage billing'),
            ('users', 'invite', 'Invite users'),
            ('users', 'remove', 'Remove users')
        `);

    // 2. Insert standard roles
    await queryRunner.query(`
            INSERT INTO "roles" ("name", "description") VALUES
            ('owner', 'Workspace Owner - Full access'),
            ('admin', 'Workspace Administrator - Management access'),
            ('agent', 'Workspace Agent - Operational access'),
            ('viewer', 'Workspace Viewer - Read-only access')
        `);

    // 3. Map Permissions to Roles

    // Owner gets everything
    await queryRunner.query(`
            INSERT INTO "role_permissions" ("role_id", "permission_id")
            SELECT r.id, p.id FROM "roles" r CROSS JOIN "permissions" p
            WHERE r.name = 'owner'
        `);

    // Admin mapping
    await queryRunner.query(`
            INSERT INTO "role_permissions" ("role_id", "permission_id")
            SELECT r.id, p.id FROM "roles" r, "permissions" p
            WHERE r.name = 'admin' AND p.resource IN ('campaigns', 'inbox', 'contacts', 'automation', 'analytics', 'users')
        `);

    // Agent mapping
    await queryRunner.query(`
            INSERT INTO "role_permissions" ("role_id", "permission_id")
            SELECT r.id, p.id FROM "roles" r, "permissions" p
            WHERE r.name = 'agent' AND (
                (p.resource = 'inbox') OR 
                (p.resource = 'contacts' AND p.action = 'read') OR
                (p.resource = 'campaigns' AND p.action = 'read')
            )
        `);

    // Viewer mapping
    await queryRunner.query(`
            INSERT INTO "role_permissions" ("role_id", "permission_id")
            SELECT r.id, p.id FROM "roles" r, "permissions" p
            WHERE r.name = 'viewer' AND p.action = 'read'
        `);

    // 4. Migrate existing memberships
    await queryRunner.query(`
            UPDATE "tenant_memberships" tm
            SET "role_id" = r.id
            FROM "roles" r
            WHERE tm.role::text = r.name
        `);

    // --- SEED DATA END ---
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenant_memberships" DROP CONSTRAINT "FK_fa9ba14be22683296a780a57c6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_agents" ALTER COLUMN "temperature" SET DEFAULT 0.7`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_agents" ALTER COLUMN "confidence_threshold" SET DEFAULT 0.7`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_memberships" DROP COLUMN "role_id"`,
    );
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7331684c0c5b063803a425001a"`,
    );
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
