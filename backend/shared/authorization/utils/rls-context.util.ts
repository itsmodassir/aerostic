import { DataSource, QueryRunner, EntityManager } from "typeorm";

export class RlsContextUtil {
  static async setContext(
    target: DataSource | QueryRunner | EntityManager,
    tenantId: string,
  ): Promise<void> {
    const query = `SET app.current_tenant = '${tenantId}'`;
    if (target instanceof DataSource) {
      await target.query(query);
    } else if (target instanceof EntityManager) {
      await target.query(query);
    } else {
      await target.query(query);
    }
  }

  static async setLocalContext(
    target: DataSource | QueryRunner | EntityManager,
    tenantId: string,
  ): Promise<void> {
    const query = `SET LOCAL app.current_tenant = '${tenantId}'`;
     if (target instanceof DataSource) {
      await target.query(query);
    } else if (target instanceof EntityManager) {
      await target.query(query);
    } else {
      await target.query(query);
    }
  }

  static async clearContext(target: DataSource | QueryRunner | EntityManager): Promise<void> {
    await target.query(`RESET app.current_tenant`);
  }
}
