import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminRoleToEnum1771151600000 implements MigrationInterface {
    name = 'AddAdminRoleToEnum1771151600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Postgres < 16 doesn't support IF NOT EXISTS for ADD VALUE.
        // We check manually to avoid errors if the value already exists.
        const check = await queryRunner.query(
            `SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'users_role_enum' AND e.enumlabel = 'admin'`
        );

        if (check.length === 0) {
            // Note: In some Postgres versions/configurations, this might need to run outside a transaction.
            // If this fails on some systems, it might be due to transaction constraints.
            await queryRunner.query(`ALTER TYPE "users_role_enum" ADD VALUE 'admin'`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Removing values from an enum is not supported by Postgres without recreating the type.
    }
}
