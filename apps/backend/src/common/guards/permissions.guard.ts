import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { permissions, user } = context.switchToHttp().getRequest();

    // Super Admin bypasses all checks
    if (user?.role === 'super_admin') {
      return true;
    }

    if (!permissions) {
      throw new ForbiddenException(
        'Access denied: No workspace permissions resolved',
      );
    }

    const hasPermission = requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied: Missing required permissions: [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
