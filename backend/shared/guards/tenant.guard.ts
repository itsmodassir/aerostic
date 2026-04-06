import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SystemRole, JwtPayload } from "../types/roles";
import { TenantMembership } from "../database/entities/core/tenant-membership.entity";

/**
 * Ensures that a user can only access resources belonging to their own tenant.
 * Super Admins are exempt from this restriction.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    @InjectRepository(TenantMembership)
    private readonly membershipRepo: Repository<TenantMembership>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
    const tenantIdFromHeader = request.targetTenantId || request.headers["x-tenant-id"];
    const tenantIdFromRoute = request.params.tenantId || request.params.id;
    const tenantIdFromQuery = request.query.tenantId;
    const tenantIdFromBody = request.body.tenantId;

    const targetTenantId =
      tenantIdFromHeader || tenantIdFromRoute || tenantIdFromQuery || tenantIdFromBody;

    // Fail-Safe: If no tenant is explicitly targeted, we default to the user's
    // authorized tenant context to ensure RLS fallback is active.
    const resolvedTenantId = targetTenantId || user.tenantId;

    if (!resolvedTenantId) {
      throw new ForbiddenException("Access Denied: Missing tenant context.");
    }

    const membership = await this.membershipRepo.findOne({
      where: {
        userId: user.id,
        tenantId: resolvedTenantId,
        status: "active",
      },
      select: ["id", "tenantId", "userId", "status"],
    });

    if (!membership) {
      throw new ForbiddenException(
        "Access Denied: Tenant isolation violation.",
      );
    }

    // Attach to request for downstream (Interceptors, etc.)
    request.targetTenantId = resolvedTenantId;

    return true;
  }
}
