import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class TenantThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // 1. Try to get tenantId from the request (attached by TenantGuard)
    const tenantId = req.membership?.tenantId || req.tenantId;
    if (tenantId) {
      return `tenant:${tenantId}`;
    }

    // 2. Fallback to userId if available
    const userId = req.user?.id;
    if (userId) {
      return `user:${userId}`;
    }

    // 3. Ultimate fallback to IP address
    return req.ip;
  }
}
