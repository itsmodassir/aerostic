import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantType } from '../../tenants/entities/tenant.entity';
import { ResellerConfig } from '../../tenants/entities/reseller-config.entity';
import { User, UserRole } from '../../users/entities/user.entity';
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

  // Summary for a specific reseller's sub-tenants
  async getResellerTenantsSummary(resellerId: string): Promise<any[]> {
    const tenants = await this.tenantRepo.find({
      where: { resellerId },
      order: { createdAt: 'DESC' },
    });

    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      tenantName: t.name,
      currentPlan: t.plan || 'starter',
      status: t.status,
      createdAt: t.createdAt,
    }));
  }

  // Improved version of getAllUsers - actually returns tenants with key info
  async getAllTenantsSummary(): Promise<any[]> {
    const tenants = await this.tenantRepo.find({
      order: { createdAt: 'DESC' },
    });

    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      tenantName: t.name,
      currentPlan: t.plan || 'starter',
      status: t.status,
      createdAt: t.createdAt,
    }));
  }

  async getResellerDetails(id: string): Promise<any> {
    const tenant = await this.getTenantById(id);
    let owner = null;
    try {
      owner = await this.getTenantOwner(id);
    } catch (e) {
      // Ignore if owner not found
    }

    return {
      ...tenant,
      owner: owner ? {
        id: owner.id,
        name: owner.name,
        email: owner.email,
      } : null,
    };
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
        order: { createdAt: 'ASC' },
      });

      if (!adminMembership || !adminMembership.user) {
        throw new NotFoundException(`No valid user found for tenant ${tenantId}`);
      }
      return adminMembership.user;
    }

    return membership.user;
  }

  async regenerateResellerPassword(id: string): Promise<{ generatedPassword: string }> {
    const user = await this.getTenantOwner(id);
    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + '!';
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(generatedPassword, salt);

    user.passwordHash = passwordHash;
    await this.userRepo.save(user);

    await this.auditService.logAction(
      'admin',
      'Administrator',
      'REGENERATE_RESELLER_PASSWORD',
      `User: ${user.email}`,
      id,
    );

    return { generatedPassword };
  }

  async deployResellerInstance(id: string): Promise<{ generatedPassword: string }> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Reseller not found');

    // If tenant is already active and has an owner, just regenerate
    try {
      const owner = await this.getTenantOwner(id);
      return this.regenerateResellerPassword(id);
    } catch (e) {
      // Create owner if it doesn't exist (e.g. if onboarded without creating user)
      const config = await this.resellerConfigRepo.findOne({ where: { tenantId: id } });
      const email = config?.supportEmail || tenant.name.toLowerCase().replace(/\s/g, '') + '@aerostic.com';

      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + '!';
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(generatedPassword, salt);

      const user = this.userRepo.create({
        email,
        name: tenant.name,
        passwordHash,
        role: UserRole.ADMIN,
      });
      const savedUser = await this.userRepo.save(user);

      const membership = this.membershipRepo.create({
        userId: savedUser.id,
        tenantId: tenant.id,
        role: TenantRole.OWNER,
        status: 'active',
      });
      await this.membershipRepo.save(membership);

      tenant.status = 'active';
      await this.tenantRepo.save(tenant);

      return { generatedPassword };
    }
  }

  async onboardReseller(dto: any): Promise<any> {
    const { name, email, slug, planId, plan, initialCredits, maxUsers, monthlyMessageLimit } = dto;

    // 1. Create Tenant
    const tenant = this.tenantRepo.create({
      name,
      slug: slug || undefined, // Entity @BeforeInsert will handle if empty, but we prefer custom
      type: TenantType.RESELLER,
      resellerCredits: initialCredits || 0,
      planId: planId || null,
      plan: plan || 'platinum', // Manual plan name
      maxUsers: maxUsers || 10,
      monthlyMessageLimit: monthlyMessageLimit || 1000,
      status: 'active',
      subscriptionStatus: 'active',
    });

    const savedTenant = await this.tenantRepo.save(tenant);

    // 2. Generate Password
    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + '!';
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(generatedPassword, salt);

    // 3. Create Owner User
    const user = this.userRepo.create({
      email,
      name,
      passwordHash,
      role: UserRole.ADMIN,
    });
    const savedUser = await this.userRepo.save(user);

    // 4. Create Membership
    const membership = this.membershipRepo.create({
      userId: savedUser.id,
      tenantId: savedTenant.id,
      role: TenantRole.OWNER,
      status: 'active',
    });
    await this.membershipRepo.save(membership);

    // 5. Create ResellerConfig
    const config = this.resellerConfigRepo.create({
      tenantId: savedTenant.id,
      brandName: name,
      supportEmail: email,
    });
    await this.resellerConfigRepo.save(config);

    // 6. Audit Log
    await this.auditService.logAction(
      'admin',
      'Administrator',
      'ONBOARD_RESELLER',
      `Partner: ${name}`,
      savedTenant.id,
      { email, planId, initialCredits },
    );

    return {
      ...savedTenant,
      generatedPassword,
    };
  }

  async updateTenantLimits(tenantId: string, dto: any): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    if (dto.monthlyMessageLimit !== undefined) tenant.monthlyMessageLimit = dto.monthlyMessageLimit;
    if (dto.aiCredits !== undefined) tenant.aiCredits = dto.aiCredits;
    if (dto.apiAccessEnabled !== undefined) tenant.apiAccessEnabled = dto.apiAccessEnabled;
    if (dto.status !== undefined) tenant.status = dto.status;

    const saved = await this.tenantRepo.save(tenant);

    await this.auditService.logAction(
      'admin',
      'Administrator',
      'UPDATE_TENANT_LIMITS',
      `Tenant: ${tenant.name}`,
      tenant.id,
      dto,
    );

    return saved;
  }

  async updateReseller(id: string, dto: any): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Reseller not found');

    // Update Tenant fields
    if (dto.name) tenant.name = dto.name;
    if (dto.slug) tenant.slug = dto.slug;
    if (dto.plan) tenant.plan = dto.plan;
    if (dto.maxUsers !== undefined) tenant.maxUsers = dto.maxUsers;
    if (dto.monthlyMessageLimit !== undefined) tenant.monthlyMessageLimit = dto.monthlyMessageLimit;
    if (dto.aiCredits !== undefined) tenant.aiCredits = dto.aiCredits;
    if (dto.status) tenant.status = dto.status;
    if (dto.apiAccessEnabled !== undefined) tenant.apiAccessEnabled = dto.apiAccessEnabled;

    const saved = await this.tenantRepo.save(tenant);

    // Update ResellerConfig fields if provided
    let config = await this.resellerConfigRepo.findOne({ where: { tenantId: id } });
    if (!config) {
      config = this.resellerConfigRepo.create({ tenantId: id });
    }

    if (dto.brandName) config.brandName = dto.brandName;
    if (dto.supportEmail) config.supportEmail = dto.supportEmail;
    if (dto.primaryColor) config.primaryColor = dto.primaryColor;
    if (dto.logo) config.logo = dto.logo;
    if (dto.domain) config.domain = dto.domain;
    if (dto.theme) config.theme = dto.theme;

    await this.resellerConfigRepo.save(config);

    await this.auditService.logAction(
      'admin',
      'Administrator',
      'UPDATE_RESELLER',
      `Partner: ${tenant.name}`,
      tenant.id,
      dto,
    );

    return saved;
  }
}
