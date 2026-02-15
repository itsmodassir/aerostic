import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMaxUsersToTenants1771151400000 implements MigrationInterface {
    name = 'AddMaxUsersToTenants1771151400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" ADD "max_users" integer NOT NULL DEFAULT '10'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "max_users"`);
    }
}
