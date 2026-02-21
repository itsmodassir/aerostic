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

    // Super Admin can access everything
    if (user.role === SystemRole.SUPER_ADMIN) {
      return true;
    }

    // Attempt to find tenantId in various locations
    const tenantIdFromRoute = request.params.tenantId || request.params.id;
    const tenantIdFromQuery = request.query.tenantId;
    const tenantIdFromBody = request.body.tenantId;

    const targetTenantId =
      tenantIdFromRoute || tenantIdFromQuery || tenantIdFromBody;

    // If no tenantId is targetted, we might be in a global context or specific route
    if (!targetTenantId) {
      return true;
    }

    if (user.tenantId !== targetTenantId) {
      throw new ForbiddenException(
        "Access Denied: Tenant isolation violation.",
      );
    }

    return true;
  }
}
