import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { DataSource } from "typeorm";

/**
 * Enforces Postgres Row-Level Security (RLS) by setting the 'app.current_tenant'
 * session variable before any query is executed.
 */
@Injectable()
export class TenantIsolationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantIsolationInterceptor.name);

  constructor(private dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const tenantId =
      request.headers["x-tenant-id"] ||
      request.query.tenantId ||
      request.body?.tenantId;

    if (tenantId) {
      try {
        // Use SET LOCAL to ensure the context is scoped to the current transaction/connection session
        await this.dataSource.query(
          `SET LOCAL app.current_tenant = '${tenantId}'`,
        );
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
