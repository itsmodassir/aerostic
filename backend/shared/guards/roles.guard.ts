import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SystemRole, ROLE_HIERARCHY, JwtPayload } from "../types/roles";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
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

    if (!user || !user.role) {
      throw new ForbiddenException("Access denied");
    }

    const userWeight = ROLE_HIERARCHY[user.role] || 0;

    // Enterprise Logic: User must satisfy at least ONE of the required role hierarchies
    const allowed = requiredRoles.some((role) => {
      const requiredWeight = ROLE_HIERARCHY[role] ?? 0;
      return userWeight >= requiredWeight;
    });

    if (!allowed) {
      throw new ForbiddenException("Access denied");
    }

    return true;
  }
}
