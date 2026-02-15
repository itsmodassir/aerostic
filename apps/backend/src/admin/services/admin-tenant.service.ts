import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantType } from '../../tenants/entities/tenant.entity';
import { ResellerConfig } from '../../tenants/entities/reseller-config.entity';
import { User } from '../../users/entities/user.entity';
import { AuditService } from '../../audit/audit.service';
import { BillingService } from '../../billing/billing.service';
import {
  PlanType,
  SubscriptionStatus,
} from '../../billing/entities/subscription.entity';
import { TenantMembership, TenantRole } from '../../tenants/entities/tenant-membership.entity';

@Injectable()
export class AdminTenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(TenantMembership)
    private membershipRepo: Repository<TenantMembership>,
    @InjectRepository(ResellerConfig)
    private resellerConfigRepo: Repository<ResellerConfig>,
    private auditService: AuditService,
    private billingService: BillingService,
  ) { }

  async getAllTenants(type?: string) {
    const where: any = {};
    if (type) {
      where.type = type;
    }
    return this.tenantRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  // Improved version of getAllUsers - actually returns tenants with key info
  async getAllTenantsSummary(): Promise<any[]> {
    const tenants = await this.tenantRepo.find({
      order: { createdAt: 'DESC' },
    });

    // In a real scenario, we might want to fetch the "Owner" user for each tenant
    // For now, we'll return tenant info correctly labeled
    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      // We don't have email on Tenant entity, so we shouldn't fake it.
      // If we need email, we should join with the owner User.
      // For now, leaving it empty or we could fetch the first user.
      tenantName: t.name,
      currentPlan: t.plan || 'starter',
      status: t.status,
      createdAt: t.createdAt,
    }));
  }

  async getTenantById(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }
    return tenant;
  }

  async updateUserPlan(
    tenantId: string,
    plan: PlanType,
    status?: SubscriptionStatus,
  ): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    const oldPlan = tenant.plan;
    tenant.plan = plan;
    const saved = await this.tenantRepo.save(tenant);

    // Sync subscription limits
    await this.billingService.manualUpdateSubscription(tenant.id, plan, status);

    await this.auditService.logAction(
      'admin',
      'Administrator',
      'UPDATE_TENANT_PLAN',
      `Tenant: ${tenant.name}`,
      tenant.id,
      { oldPlan, newPlan: plan, status },
    );

    return saved;
  }

  async getTenantOwner(tenantId: string): Promise<User> {
    const membership = await this.membershipRepo.findOne({
      where: {
        tenantId,
        role: TenantRole.OWNER,
      },
      relations: ['user'],
    });

    if (!membership || !membership.user) {
      // Fallback: Try to find ANY admin if owner is missing (rare case)
      const adminMembership = await this.membershipRepo.findOne({
        where: { tenantId },
        relations: ['user'],
        order: { createdAt: 'ASC' }, // Oldest member often creator
      });

      if (!adminMembership || !adminMembership.user) {
        throw new NotFoundException(`No valid user found for tenant ${tenantId}`);
      }
      return adminMembership.user;
    }

    return membership.user;
  }

  async onboardReseller(dto: any): Promise<Tenant> {
    const { name, email, planId, initialCredits } = dto;

    // 1. Create Tenant
    const tenant = this.tenantRepo.create({
      name,
      type: TenantType.RESELLER,
      resellerCredits: initialCredits || 0,
      planId: planId || null,
      status: 'active',
      subscriptionStatus: 'active', // Resellers are active by default usually
    });

    const savedTenant = await this.tenantRepo.save(tenant);

    // 2. Create ResellerConfig
    const config = this.resellerConfigRepo.create({
      tenantId: savedTenant.id,
      brandName: name,
      supportEmail: email,
    });
    await this.resellerConfigRepo.save(config);

    // 3. Audit Log
    await this.auditService.logAction(
      'admin',
      'Administrator',
      'ONBOARD_RESELLER',
      `Partner: ${name}`,
      savedTenant.id,
      { email, planId, initialCredits },
    );

    return savedTenant;
  }
}
