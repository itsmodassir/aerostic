
import {
    Injectable,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class SuperAdminGuard extends JwtAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // First, run standard JWT authentication
        const isAuthenticated = await super.canActivate(context);
        if (!isAuthenticated) return false;

        // Then check for super_admin role
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Strict Super Admin Role Check
        if (user?.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException(
                'Access Denied: Super Administrator privileges required.',
            );
        }

        return true;
    }
}
