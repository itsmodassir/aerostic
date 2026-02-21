import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../api-service/auth/jwt-auth.guard";
import { UsersService } from "../../api-service/users/users.service";
import { AuditService } from "../../api-service/audit/audit.service";

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  constructor(
    private usersService: UsersService,
    private auditService: AuditService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Run standard JWT authentication
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) return false;

    const request = context.switchToHttp().getRequest();
    const userPayload = request.user;

    if (!userPayload?.id) {
      throw new UnauthorizedException("Invalid user context");
    }

    // 2. Fetch fresh user from DB (Authority verification)
    const user = await this.usersService.findOne(userPayload.id);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (!user.isActive) {
      throw new ForbiddenException("Account is disabled");
    }

    // 3. Strict platform role check
    const allowedRoles = ["admin", "super_admin"];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        "Access Denied: Administrator privileges required.",
      );
    }

    // 4. Audit Log Admin Access (SOC2 Requirement)
    // We attempt to find a tenant ID from request or user memberships
    // For platform admins, we use a generic 'system' or their primary tenant
    const tenantId =
      request.headers["x-tenant-id"] || userPayload.tenantId || "system";

    await this.auditService
      .log({
        actorType: "admin",
        actorId: user.id,
        action: "ADMIN_ACCESS",
        resourceType: "system_route",
        resourceId: request.url,
        tenantId: tenantId.toString(),
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"] || "unknown",
        metadata: {
          method: request.method,
          path: request.path,
          role: user.role,
        },
      })
      .catch((err) => {
        // Don't block access if logging fails, but log error
        console.error("Failed to log admin access audit:", err);
      });

    // 5. Attach fresh user to request (authority propagation)
    request.user = user;

    return true;
  }
}
