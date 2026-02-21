import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request["user"];

    // Get tenantId from different possible sources (Params, Body, Query)
    const tenantIdFromResource =
      request.params.tenantId ||
      request.body.tenantId ||
      request.query.tenantId;

    if (!user || !user.tenantId) {
      throw new ForbiddenException("Tenant context missing in authentication");
    }

    // If a specific tenant resource is requested, it MUST match the user's tenantId
    if (tenantIdFromResource && tenantIdFromResource !== user.tenantId) {
      throw new ForbiddenException("Access denied: Unauthorized tenant access");
    }

    return true;
  }
}
