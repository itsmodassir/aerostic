import { DataSource, QueryRunner, EntityManager } from "typeorm";

export class RlsContextUtil {
  static async setContext(
    target: DataSource | QueryRunner | EntityManager,
    tenantId: string,
  ): Promise<void> {
    await target.query(`SELECT set_config('app.current_tenant', $1, false)`, [
      tenantId,
    ]);
  }

  static async setLocalContext(
    target: DataSource | QueryRunner | EntityManager,
    tenantId: string,
  ): Promise<void> {
    await target.query(`SELECT set_config('app.current_tenant', $1, true)`, [
      tenantId,
    ]);
  }

  static async clearContext(
    target: DataSource | QueryRunner | EntityManager,
  ): Promise<void> {
    await target.query(`SELECT set_config('app.current_tenant', '', true)`);
  }
}
