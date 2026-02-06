import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
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

    // Strict Admin Role Check (Allow admin OR super_admin)
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ForbiddenException(
        'Access Denied: Administrator privileges required.',
      );
    }

    return true;
  }
}
