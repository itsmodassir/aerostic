import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Get tenant from JWT user or API key
    const tenantId = request.user?.tenantId || request.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Tenant not identified');
    }

    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });

    if (!tenant) {
      throw new UnauthorizedException('Tenant not found');
    }

    if (tenant.status !== 'active') {
      throw new UnauthorizedException('Tenant is inactive');
    }

    // Check subscription status
    if (tenant.subscriptionStatus === 'cancelled') {
      throw new UnauthorizedException('Subscription cancelled');
    }

    // Attach tenant to request
    request.tenant = tenant;

    return true;
  }
}
