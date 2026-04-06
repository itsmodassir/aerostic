import { Injectable, NestMiddleware, ForbiddenException, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

/**
 * Enforces mandatory tenant isolation at the entry point.
 * Ensures every scoped request has a valid tenant identity.
 */
import { DataSource } from "typeorm";
import { RlsContextUtil } from "../authorization/utils/rls-context.util";

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantContextMiddleware.name);
  constructor(private dataSource: DataSource) { }
  private readonly EXCLUDED_PATHS = [
    "auth",
    "webhooks",
    "health",
    "admin",
    "whatsapp/public-config",
    "meta/callback",
    "meta/webhook",
  ];

  async use(req: Request, res: Response, next: NextFunction) {
    const path = req.path;
    const originalUrl = req.originalUrl || "";
    
    const isExcluded = this.EXCLUDED_PATHS.some((p) =>
      path.includes(p) || originalUrl.includes(p),
    );

    if (isExcluded) {
      return next();
    }

    let tenantId =
      req.headers["x-tenant-id"] ||
      req.query.tenantId ||
      (req as any).params?.tenantId ||
      req.body?.tenantId;

    if (!tenantId) {
      // Fallback: Check for access_token cookie
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        const cookies: Record<string, string> = {};
        cookieHeader.split(';').forEach(c => {
          const eqIdx = c.indexOf('=');
          if (eqIdx > -1) {
            const key = c.slice(0, eqIdx).trim();
            const val = c.slice(eqIdx + 1).trim();
            cookies[key] = val;
          }
        });

        const token = cookies['access_token'];
        if (token) {
          try {
            const payloadBase64 = token.split('.')[1];
            if (payloadBase64) {
              // Handle URL-safe base64
              const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
              if (payload?.tenantId) {
                tenantId = payload.tenantId;
                this.logger.log(`Fall back to JWT tenantId: ${tenantId}`);
              }
            }
          } catch (e) {
            this.logger.error("Failed to decode fallback JWT:", e.message);
          }
        }
      }
    }

    if (!tenantId) {
      this.logger.warn(
        `Multi-tenant violation: Path=${req.path}, OriginalUrl=${req.originalUrl}, Host=${req.headers.host}`,
      );
      throw new ForbiddenException(
        "Multi-tenant boundary violation: Header [x-tenant-id] or parameter [tenantId] is required.",
      );
    }

    // Resolve SLUG to UUID if necessary
    const { validate: isUuid } = require("uuid");
    if (typeof tenantId === "string" && !isUuid(tenantId)) {
      const cacheKey = `tenant_slug:${tenantId}`;
      let resolvedId = await this.dataSource.query(
        `SELECT id FROM tenants WHERE slug = $1`,
        [tenantId]
      ).then(res => res[0]?.id);

      if (!resolvedId) {
        throw new ForbiddenException(`Invalid tenant context: ${tenantId}`);
      }

      this.logger.log(`Resolved tenant slug '${tenantId}' to UUID: ${resolvedId}`);
      tenantId = resolvedId;
      // Mutate header so subsequent layers see the UUID
      req.headers["x-tenant-id"] = resolvedId;
    }

    // Attach to request for consistent access in guards and controllers
    (req as any).targetTenantId = tenantId;
    (req as any).tenant = { id: tenantId };

    // Set Postgres RLS context
    try {
      await RlsContextUtil.setContext(this.dataSource, tenantId);
    } catch (err) {
      this.logger.error(`Failed to set RLS context: ${err.message}`);
    }

    next();
  }
}
