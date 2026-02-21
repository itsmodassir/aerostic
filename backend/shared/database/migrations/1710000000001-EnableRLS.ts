import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration to enable Postgres Row-Level Security (RLS) for multi-tenant isolation.
 * This ensures that even if application logic fails, one tenant cannot access another's data.
 */
export class EnableRLS1710000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      "tenants",
      "users",
      "tenant_memberships",
      "campaigns",
      "campaign_recipients",
      "messages",
      "conversations",
      "workflows",
      "workflow_versions",
      "automation_rules",
      "automation_executions",
      "ai_agents",
      "knowledge_bases",
      "knowledge_chunks",
      "api_keys",
      "subscriptions",
      "usage_events",
      "wallets",
      "wallet_accounts",
      "wallet_transactions",
    ];

    for (const table of tables) {
      // Check if table exists
      const hasTable = await queryRunner.hasTable(table);
      if (!hasTable) continue;

      // 1. Enable RLS
      await queryRunner.query(
        `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY`,
      );

      // 2. Create Policy
      const column =
        table === "tenants" || table === "users" ? "id" : "tenant_id";

      await queryRunner.query(`
                DROP POLICY IF EXISTS tenant_isolation_policy ON "${table}"
            `);

      await queryRunner.query(`
                CREATE POLICY tenant_isolation_policy ON "${table}"
                USING (${column} = current_setting('app.current_tenant', true)::uuid)
            `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      "tenants",
      "users",
      "tenant_memberships",
      "campaigns",
      "campaign_recipients",
      "messages",
      "conversations",
      "workflows",
      "workflow_versions",
      "automation_rules",
      "automation_executions",
      "ai_agents",
      "knowledge_bases",
      "knowledge_chunks",
      "api_keys",
      "subscriptions",
      "usage_events",
    ];

    for (const table of tables) {
      await queryRunner.query(
        `DROP POLICY IF EXISTS tenant_isolation_policy ON "${table}"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY`,
      );
    }
  }
}
