import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRejectionReasonToTemplates1770985200000 implements MigrationInterface {
    name = 'AddRejectionReasonToTemplates1770985200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "templates" ADD "rejection_reason" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "rejection_reason"`);
    }
}
