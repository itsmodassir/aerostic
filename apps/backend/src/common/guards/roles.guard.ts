import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { TenantRole } from '../../tenants/entities/tenant-membership.entity';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<TenantRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { role, user } = context.switchToHttp().getRequest();

        // Super Admin bypasses all role checks
        if (user?.role === 'super_admin') {
            return true;
        }

        if (!role) {
            throw new ForbiddenException('Access denied: No workspace role found');
        }

        const hasRole = requiredRoles.includes(role);
        if (!hasRole) {
            throw new ForbiddenException(
                `Access denied: Required roles: [${requiredRoles.join(', ')}]. Your role: ${role}`,
            );
        }

        return true;
    }
}
