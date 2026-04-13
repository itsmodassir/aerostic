import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SystemRole, ROLE_HIERARCHY, JwtPayload } from "../types/roles";
import { AuthzCacheService } from "../authorization/cache/authz-cache.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authzCache: AuthzCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(
      "requiredRoles",
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user || (!user.id && !user.sub)) {
      throw new ForbiddenException("Access denied: No user context");
    }

    const tenantId = request.headers["x-tenant-id"] || request.query.tenantId || request.body?.tenantId;

    const authContext = await this.authzCache.getAuthContext(user.id || user.sub, tenantId);

    if (!authContext || !authContext.systemRole) {
      throw new ForbiddenException("Access denied: Invalid role configuration");
    }

    const userWeight = ROLE_HIERARCHY[authContext.systemRole] || 0;

    // Enterprise Logic: User must satisfy at least ONE of the required role hierarchies
    const allowed = requiredRoles.some((role) => {
      const requiredWeight = ROLE_HIERARCHY[role] ?? 0;
      return userWeight >= requiredWeight;
    });

    if (!allowed) {
      throw new ForbiddenException("Access denied: Strict role requirements not met");
    }

    return true;
  }
}
