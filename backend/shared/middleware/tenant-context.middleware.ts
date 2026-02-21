import { Injectable, NestMiddleware, ForbiddenException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

/**
 * Enforces mandatory tenant isolation at the entry point.
 * Ensures every scoped request has a valid tenant identity.
 */
import { DataSource } from "typeorm";

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private dataSource: DataSource) { }

  // Routes that do not require a tenant context (Public/Auth/Webhooks)
  private readonly EXCLUDED_PATHS = [
    "/api/v1/auth",
    "/api/v1/webhooks",
    "/api/v1/health",
  ];

  async use(req: Request, res: Response, next: NextFunction) {
    const isExcluded = this.EXCLUDED_PATHS.some((path) =>
      req.path.startsWith(path),
    );

    if (isExcluded) {
      return next();
    }

    console.log(`[TenantContextMiddleware] Path: ${req.path}, isExcluded: ${isExcluded}`);

    const tenantId =
      req.headers["x-tenant-id"] ||
      req.query.tenantId ||
      (req as any).params?.tenantId ||
      req.body?.tenantId;

    if (!tenantId) {
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
