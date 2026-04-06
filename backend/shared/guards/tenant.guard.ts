import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { SystemRole, JwtPayload } from "../types/roles";

/**
 * Ensures that a user can only access resources belonging to their own tenant.
 * Super Admins are exempt from this restriction.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user) return false;

    // Super Admin can access everything ONLY if not impersonating
    if (user.role === SystemRole.SUPER_ADMIN && !user.isImpersonation) {
      return true;
    }

    // Security: If impersonating, block destructive actions (DELETE)
    if (user.isImpersonation && request.method === "DELETE") {
      throw new ForbiddenException(
        "Access Denied: Destructive actions are disabled during impersonation.",
      );
    }

    // Attempt to find tenantId in various locations
    const tenantIdFromRoute = request.params.tenantId || request.params.id;
    const tenantIdFromQuery = request.query.tenantId;
    const tenantIdFromBody = request.body.tenantId;

    const targetTenantId =
      tenantIdFromRoute || tenantIdFromQuery || tenantIdFromBody;

    // Fail-Safe: If no tenant is explicitly targeted, we default to the user's
    // authorized tenant context to ensure RLS fallback is active.
    const resolvedTenantId = targetTenantId || user.tenantId;

    if (!resolvedTenantId) {
      throw new ForbiddenException("Access Denied: Missing tenant context.");
    }

    if (user.tenantId !== resolvedTenantId) {
      throw new ForbiddenException(
        "Access Denied: Tenant isolation violation.",
      );
    }

    // Attach to request for downstream (Interceptors, etc.)
    request.targetTenantId = resolvedTenantId;

    return true;
  }
}
