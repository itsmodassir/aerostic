import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { DataSource } from "typeorm";

const STRICT_ALLOWED_TABLES = new Set([
  "tenants",
  "users",
  "subscriptions",
  "plans",
  "messages",
  "campaigns",
  "wallet_transactions",
  "usage_events",
  "webhooks",
  "system_configs",
  "mailboxes",
  "email_messages",
  "audit_logs",
  "system_daily_metrics",
  "tenant_daily_metrics",
]);

const SENSITIVE_COLUMNS = new Set([
  "password_hash",
  "key_hash",
  "value", // system_configs encrypted value
  "webhook_secret",
  "smtp_config",
  "imap_config",
  "token_version",
  "refresh_token",
  "encryption_key",
]);

@Injectable()
export class AdminDatabaseService {
  constructor(private dataSource: DataSource) {}

  /**
   * Internal security check.
   * In a real system, this would be backed by a Request context/User role check.
   */
  private verifyAccess(role?: string) {
    // This is a placeholder for service-level guardrail logic
    // if (role !== 'SUPER_ADMIN') throw new UnauthorizedException();
  }

  async getTables() {
    try {
      this.verifyAccess();

      // Filter the public schema tables against our whitelist
      const tablesRaw = await this.dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);

      return tablesRaw
        .map((t: any) => t.table_name)
        .filter((name: string) => STRICT_ALLOWED_TABLES.has(name));
    } catch (error) {
      throw new InternalServerErrorException("Failed to fetch table list");
    }
  }

  async getTableData(tableName: string, page: number = 1, limit: number = 50) {
    try {
      this.verifyAccess();

      // 1. Strict Whitelist Check (Critical Security)
      if (!STRICT_ALLOWED_TABLES.has(tableName)) {
        throw new Error("Access denied to requested table");
      }

      const offset = (page - 1) * limit;

      // 2. Set statement timeout for this session (Operational Safety)
      await this.dataSource.query("SET statement_timeout = 5000");

      // 3. Get table columns
      const columnsRaw = await this.dataSource.query(
        `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `,
        [tableName],
      );

      // 4. Get performance-optimized count (Scale Safety)
      const countRes = await this.dataSource.query(`
        SELECT 
          CASE 
            WHEN count_estimate > 100000 THEN count_estimate 
            ELSE (SELECT count(*) FROM "${tableName}") 
          END as count 
        FROM (
          SELECT reltuples::bigint AS count_estimate 
          FROM pg_class 
          WHERE oid = '"${tableName}"'::regclass
        ) as stats
      `);
      const total = parseInt(countRes[0].count);

      // 5. Fetch rows with LIMIT/OFFSET
      const dataRaw = await this.dataSource.query(
        `
        SELECT * FROM "${tableName}" 
        LIMIT $1 OFFSET $2
      `,
        [limit, offset],
      );

      // 6. Mandatory Column Masking (Privacy Security)
      const data = dataRaw.map((row: any) => {
        const maskedRow = { ...row };
        Object.keys(maskedRow).forEach((col) => {
          if (
            SENSITIVE_COLUMNS.has(col) ||
            col.includes("secret") ||
            col.includes("hash")
          ) {
            maskedRow[col] = "••••••••";
          }
        });
        return maskedRow;
      });

      return {
        tableName,
        columns: columnsRaw,
        data,
        total,
        isApproximate: total > 100000,
        page,
        limit,
      };
    } catch (error) {
      console.error(`Error fetching data for ${tableName}:`, error);
      throw new InternalServerErrorException(
        error.message.includes("denied")
          ? error.message
          : `Failed to fetch data for ${tableName}`,
      );
    } finally {
      // Reset timeout
      await this.dataSource.query("SET statement_timeout = 0").catch(() => {});
    }
  }
}
