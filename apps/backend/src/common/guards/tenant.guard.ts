import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { TenantMembership } from '../../tenants/entities/tenant-membership.entity';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantMembership)
    private membershipRepo: Repository<TenantMembership>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const hostname = request.headers['host'] || '';

    // 1. Resolve Tenant from Host (Subdomain)
    let tenantFromHost: Tenant | null = null;
    const baseDomain = 'aerostic.com';
    const reserved = ['app', 'admin', 'api', 'www'];

    if (hostname.endsWith(baseDomain) && !hostname.includes('localhost')) {
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        const subdomain = parts[0];
        if (!reserved.includes(subdomain)) {
          // Attempt to find tenant by slug
          tenantFromHost = await this.tenantRepo.findOne({ where: { slug: subdomain } });
        }
      }
    }

    // 2. Resolve Tenant ID from User/JWT
    const tenantIdFromUser = request.user?.tenantId;

    // 3. Identification Logic
    // If a subdomain is used, it takes priority as the context
    let targetTenant: Tenant | null = null;

    if (tenantFromHost) {
      targetTenant = tenantFromHost;
    } else if (tenantIdFromUser) {
      targetTenant = await this.tenantRepo.findOne({ where: { id: tenantIdFromUser } });
    }

    if (!targetTenant) {
      throw new UnauthorizedException('Tenant not identified or invalid context');
    }

    // 4. Verification Check: Does the user have a membership in this tenant?
    if (request.user && request.user.role !== 'super_admin') {
      const membership = await this.membershipRepo.findOne({
        where: { userId: request.user.id, tenantId: targetTenant.id },
        relations: ['roleEntity', 'roleEntity.rolePermissions', 'roleEntity.rolePermissions.permission'],
      });

      if (!membership) {
        throw new UnauthorizedException('You do not have access to this workspace');
      }

      // 5. Build Permissions String Array (e.g., ['campaigns:send', 'inbox:read'])
      const permissions = membership.roleEntity?.rolePermissions?.map(
        rp => `${rp.permission.resource}:${rp.permission.action}`
      ) || [];

      // Attach to request for downstream guards and controllers
      request.membership = membership;
      request.permissions = permissions;
      request.role = membership.roleEntity?.name || membership.role;
    }

    if (targetTenant.status !== 'active') {
      throw new UnauthorizedException('Tenant is inactive');
    }

    // Check subscription status
    if (targetTenant.subscriptionStatus === 'cancelled') {
      throw new UnauthorizedException('Subscription cancelled');
    }

    // Attach tenant to request
    request.tenant = targetTenant;

    return true;
  }
}
