import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { API_PERMISSION_KEY } from "../decorators/api-permission.decorator";
import { AnomalyService } from "../../api-service/analytics/anomaly.service";

@Injectable()
export class ApiPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private anomalyService: AnomalyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      API_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Support BOTH API Key and JWT users
    const apiKey = request.apiKey;
    const user = request.user;

    if (!apiKey && !user) {
      throw new ForbiddenException(
        "Authentication required for authorized API access",
      );
    }

    const grantedPermissions = apiKey?.permissions || user?.permissions || [];
    const tenantId = apiKey?.tenantId || user?.tenantId;
    const actorId = apiKey?.id || user?.id;
    const actorType = apiKey ? "api_key" : "user";

    const hasPermission = requiredPermissions.every((required) =>
      this.checkPermission(grantedPermissions, required),
    );

    if (!hasPermission) {
      // Log violation to anomaly system
      if (tenantId && actorId) {
        await this.anomalyService.flagPermissionViolation(
          tenantId,
          actorId,
          actorType,
          requiredPermissions.join(", "),
        );
      }

      throw new ForbiddenException("Insufficient API permissions");
    }

    return true;
  }

  private checkPermission(granted: string[], required: string): boolean {
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
