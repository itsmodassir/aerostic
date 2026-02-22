import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailTemplates1740268800001 implements MigrationInterface {
    name = "CreateEmailTemplates1740268800001";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS email_templates (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id uuid NOT NULL,
                name varchar(255) NOT NULL,
                subject varchar(255) NOT NULL,
                content text NOT NULL,
                variables jsonb DEFAULT '[]',
                created_at timestamp with time zone DEFAULT now(),
                updated_at timestamp with time zone DEFAULT now(),
                CONSTRAINT fk_email_template_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`CREATE INDEX idx_email_templates_tenant ON email_templates(tenant_id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_email_templates_tenant`);
        await queryRunner.query(`DROP TABLE IF EXISTS email_templates`);
    }
}
