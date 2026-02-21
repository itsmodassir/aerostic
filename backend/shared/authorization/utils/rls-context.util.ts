import { DataSource } from "typeorm";

export class RlsContextUtil {
  static async setContext(
    dataSource: DataSource,
    tenantId: string,
  ): Promise<void> {
    await dataSource.query(`SET app.current_tenant = '${tenantId}'`);
  }

  static async clearContext(dataSource: DataSource): Promise<void> {
    await dataSource.query(`RESET app.current_tenant`);
  }
}
