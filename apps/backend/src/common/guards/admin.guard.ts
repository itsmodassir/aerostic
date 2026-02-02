import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // First, run standard JWT authentication
        const isAuthenticated = await super.canActivate(context);
        if (!isAuthenticated) return false;

        // Then check for admin role
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Strict Admin Role Check
        if (user?.role !== 'admin') {
            throw new ForbiddenException('Access Denied: Administrator privileges required.');
        }

        return true;
    }
}
