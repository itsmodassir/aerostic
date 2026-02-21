import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { TenantsService } from "../../api-service/tenants/tenants.service";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantsService: TenantsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super Admin bypasses all checks
    if (user?.role === "super_admin") {
      return true;
    }

    // 1. Determine target tenant context
    const tenantId =
      request.params.tenantId ||
      request.params.id ||
      request.query.tenantId ||
      request.body.tenantId ||
      request.headers["x-tenant-id"];

    if (!tenantId || !user?.id) {
      throw new ForbiddenException("Access denied: Workspace context required");
    }

    // 2. Resolve permissions from source-of-truth (with caching)
    const permissions = await this.tenantsService.getPermissions(
      user.id,
      tenantId,
    );

    if (!permissions.length) {
      throw new ForbiddenException("Access denied");
    }

    // 3. Match permissions with wildcard support
    const hasPermission = requiredPermissions.every((required) =>
      this.matchPermission(permissions, required),
    );

    if (!hasPermission) {
      throw new ForbiddenException("Access denied");
    }

    // Attach resolved permissions to request for downstream use if needed
    request.workspacePermissions = permissions;

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
