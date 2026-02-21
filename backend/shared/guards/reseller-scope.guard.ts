import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { SystemRole, JwtPayload } from "../types/roles";
import { AnomalyService } from "../../api-service/analytics/anomaly.service";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { ResellerService } from "../../api-service/reseller/reseller.service";

/**
 * Ensures that a Reseller Admin can only access tenants that belong to them.
 * High-performance version using Redis caching from ResellerService.
 */
@Injectable()
export class ResellerScopeGuard implements CanActivate {
  constructor(
    private resellerService: ResellerService,
    private anomalyService: AnomalyService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user) {
      throw new ForbiddenException("Authentication required");
    }

    if (!user.tenantId) {
      throw new ForbiddenException(
        "Reseller context (tenantId) missing from token",
      );
    }

    // 1. Only applies to reseller admins
    if (user.role !== SystemRole.RESELLER_ADMIN) {
      return true;
    }

    const targetTenantId =
      request.params?.tenantId ||
      request.params?.id ||
      request.query?.tenantId ||
      request.body?.tenantId ||
      request.headers["x-tenant-id"];

    if (!targetTenantId) {
      return true;
    }

    // 2. Self-Tenant Protection: Allow reseller to access their own workspace
    if (targetTenantId === user.tenantId) {
      return true;
    }

    // 3. Resolve allowed sub-tenants from Redis cache
    const allowedTenantIds = await this.resellerService.getResellerScope(
      user.tenantId,
    );

    if (!allowedTenantIds.includes(targetTenantId)) {
      // SECURITY ANOMALY: Unauthorized cross-tenant management attempt
      await this.anomalyService.flagPermissionViolation(
        user.tenantId,
        user.id,
        "user",
        `cross_tenant_access:${targetTenantId}`,
      );

      throw new ForbiddenException(
        "Access denied: tenant does not belong to your reseller account",
      );
    }

    // 4. Optional: Check for specific reseller permissions if required via @Permissions
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermissions?.length) {
      const hasPermission = requiredPermissions.every((req) =>
        this.matchPermission(user.permissions || [], req),
      );
      if (!hasPermission) {
        throw new ForbiddenException(
          "Access Denied: Insufficient reseller permissions.",
        );
      }
    }

    return true;
  }

  private matchPermission(granted: string[], required: string): boolean {
    return granted.some((perm) => {
      if (perm === "*") return true;
      if (perm.endsWith(":*")) {
        const prefix = perm.split(":")[0];
        return required.startsWith(prefix + ":");
      }
      return perm === required;
    });
  }
}
