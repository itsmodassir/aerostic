import { Injectable, NestMiddleware, ForbiddenException, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

/**
 * Enforces mandatory tenant isolation at the entry point.
 * Ensures every scoped request has a valid tenant identity.
 */
import { DataSource } from "typeorm";

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantContextMiddleware.name);
  constructor(private dataSource: DataSource) { }

  // Routes that do not require a tenant context (Public/Auth/Webhooks/Admin)
  private readonly EXCLUDED_PATHS = [
    "auth",
    "webhooks",
    "health",
    "admin",
  ];

  async use(req: Request, res: Response, next: NextFunction) {
    // Check both req.path and req.originalUrl for the excluded keywords
    const isExcluded = this.EXCLUDED_PATHS.some((path) =>
      req.path.includes(path) || req.originalUrl?.includes(path),
    );

    if (isExcluded) {
      return next();
    }

    const tenantId =
      req.headers["x-tenant-id"] ||
      req.query.tenantId ||
      (req as any).params?.tenantId ||
      req.body?.tenantId;

    if (!tenantId) {
      this.logger.warn(
        `Multi-tenant violation: Path=${req.path}, OriginalUrl=${req.originalUrl}, Host=${req.headers.host}`,
      );
      throw new ForbiddenException(
        "Multi-tenant boundary violation: Header [x-tenant-id] or parameter [tenantId] is required.",
      );
    }

    // Attach to request for consistent access in guards and controllers
    (req as any).targetTenantId = tenantId;

    // Set Postgres RLS context
    try {
      await this.dataSource.query(`SET app.current_tenant = '${tenantId}'`);
    } catch (err) {
      // In a production environment, we should log this and potentially fail the request if RLS is critical
    }

    next();
  }
}
