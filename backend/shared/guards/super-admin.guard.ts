import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../api-service/auth/jwt-auth.guard";
import { UsersService } from "../../api-service/users/users.service";
import { AuditService } from "../../api-service/audit/audit.service";
import { UserRole } from "../database/entities/core/user.entity";

@Injectable()
export class SuperAdminGuard extends JwtAuthGuard {
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

    // 2. Fetch fresh user from DB
    const user = await this.usersService.findOne(userPayload.id);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (!user.isActive) {
      throw new ForbiddenException("Account is disabled");
    }

    // 3. Strict Super Admin check
    if ((user.role as UserRole) !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        "Access Denied: Super Administrator privileges required for this action.",
      );
    }

    // 4. Audit Log High-Privilege Access
    const tenantId =
      request.headers["x-tenant-id"] || userPayload.tenantId || "system";

    await this.auditService
      .log({
        actorType: "admin",
        actorId: user.id,
        action: "SUPER_ADMIN_ACCESS",
        resourceType: "destructive_route",
        resourceId: request.url,
        tenantId: tenantId.toString(),
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"] || "unknown",
        metadata: {
          method: request.method,
          path: request.path,
          privilege: "SUPER_ADMIN",
        },
      })
      .catch((err) => {
        console.error("Failed to log super admin access audit:", err);
      });

    request.user = user;

    return true;
  }
}
