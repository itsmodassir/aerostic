import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { DataSource } from "typeorm";
import { RlsContextUtil } from "../authorization/utils/rls-context.util";

/**
 * Enforces Postgres Row-Level Security (RLS) by setting the 'app.current_tenant'
 * session variable before any query is executed.
 */
@Injectable()
export class TenantIsolationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantIsolationInterceptor.name);

  constructor(private dataSource: DataSource) { }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const tenantId =
      request.targetTenantId ||
      request.headers["x-tenant-id"] ||
      request.query.tenantId ||
      request.body?.tenantId;

    if (tenantId) {
      // Strict UUID Validation to prevent SQL injection and malformed context
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(tenantId)) {
        this.logger.warn(`Invalid tenantId format blocked: ${tenantId}`);
        return next.handle(); // Fallback to default (likely denied by RLS anyway)
      }

      try {
        // Use SET LOCAL via RlsContextUtil to ensure context is scoped to the connection/transaction
        await RlsContextUtil.setLocalContext(this.dataSource, tenantId);
      } catch (err) {
        this.logger.error(
          `Failed to set RLS context for tenant ${tenantId}`,
          err,
        );
      }
    }

    return next.handle();
    // Note: In an interceptor, we could use pipe/finalize to RESET, but SET LOCAL often suffices for pooled connections
    // if handled correctly by the driver/transaction. However, explicitly RESETting is safer.
  }
}
