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
    console.log(`[TenantGuard] Hostname: ${hostname}`);

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
          tenantFromHost = await this.tenantRepo.findOne({
            where: { slug: subdomain },
          });
        }
      }
    }

    // 2. Resolve Tenant ID from User/JWT or Header
    const tenantIdFromUser =
      request.user?.tenantId || request.headers['x-tenant-id'];

    // 3. Identification Logic
    // Subdomain > JWT/Header
    let targetTenant: Tenant | null = null;

    if (tenantFromHost) {
      targetTenant = tenantFromHost;
    } else if (tenantIdFromUser) {
      // Ensure it's a valid UUID before querying
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(tenantIdFromUser)) {
        targetTenant = await this.tenantRepo.findOne({
          where: { id: tenantIdFromUser },
        });
      }
    }

    if (!targetTenant) {
      console.warn(`[TenantGuard] No tenant found for host: ${hostname}`);
      throw new UnauthorizedException(
        'Tenant not identified or invalid context',
      );
    }
    console.log(`[TenantGuard] Resolved Tenant: ${targetTenant.slug} (Type: ${targetTenant.type})`);

    // 4. Verification Check: Does the user have a membership in this tenant?
    if (request.user) {
      let membership = await this.membershipRepo.findOne({
        where: { userId: request.user.id, tenantId: targetTenant.id },
        relations: [
          'tenant',
          'tenant.resellerConfig',
          'tenant.reseller',
          'tenant.reseller.resellerConfig',
          'roleEntity',
          'roleEntity.rolePermissions',
          'roleEntity.rolePermissions.permission',
        ],
      });

      // Special handling for super_admin: Allow access even without explicit membership
      if (!membership && request.user.role === 'super_admin') {
        const fullTenant = await this.tenantRepo.findOne({
          where: { id: targetTenant.id },
          relations: ['resellerConfig', 'reseller', 'reseller.resellerConfig'],
        });

        membership = {
          userId: request.user.id,
          tenantId: targetTenant.id,
          tenant: fullTenant,
          role: 'owner', // Act as owner in context
          status: 'active',
          permissions: [], // Controllers might need specific check, but frontend needs the object
        } as any;
      }

      if (!membership) {
        throw new UnauthorizedException(
          'You do not have access to this workspace',
        );
      }

      // 5. Build Permissions String Array (e.g., ['campaigns:send', 'inbox:read'])
      const permissions =
        membership.roleEntity?.rolePermissions?.map(
          (rp) => `${rp.permission.resource}:${rp.permission.action}`,
        ) || [];

      // Attach to request for downstream guards and controllers
      request.membership = membership;
      request.permissions = permissions;
      request.role = membership.roleEntity?.name || membership.role;
      console.log(`[TenantGuard] Membership attached: ${membership.tenant?.slug} (Role: ${request.role}, TenantType: ${membership.tenant?.type})`);
    }

    if (targetTenant.status !== 'active') {
      throw new UnauthorizedException('Tenant is inactive');
    }

    // Check subscription status
    if (targetTenant.subscriptionStatus === 'cancelled') {
      throw new UnauthorizedException('Subscription cancelled');
    }

    if (
      targetTenant.subscriptionStatus === 'trialing' &&
      targetTenant.trialEndsAt &&
      new Date() > targetTenant.trialEndsAt
    ) {
      throw new UnauthorizedException(
        'Trial expired. Please upgrade your plan.',
      );
    }

    // Attach tenant to request
    request.tenant = targetTenant;

    return true;
  }
}
