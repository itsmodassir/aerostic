import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import {
  Tenant,
  TenantType,
} from "@shared/database/entities/core/tenant.entity";
import { ResellerConfig } from "../../tenants/entities/reseller-config.entity";
import { User, UserRole } from "../../users/entities/user.entity";
import { AuditService } from "../../audit/audit.service";
import { BillingService } from "../../billing/billing.service";
import {
  Subscription,
  SubscriptionStatus,
  PlanType,
} from "@shared/database/entities/billing/subscription.entity";
import {
  TenantMembership,
  TenantRole,
} from "@shared/database/entities/core/tenant-membership.entity";

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
    @Inject(forwardRef(() => BillingService))
    private billingService: BillingService,
    private dataSource: DataSource,
  ) { }

  /**
   * Generates a cryptographically secure random password.
   */
  private generateSecurePassword(): string {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const bytes = randomBytes(12);
    let password = "";
    for (let i = 0; i < bytes.length; i++) {
      password += chars[bytes[i] % chars.length];
    }
    return password;
  }

  async getAllTenants(
    options: {
      type?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { type, status, search, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.tenantRepo.createQueryBuilder("tenant");

    if (type) {
      queryBuilder.andWhere("tenant.type = :type", { type });
    }

    if (status) {
      queryBuilder.andWhere("tenant.status = :status", { status });
    }

    if (search) {
      queryBuilder.andWhere(
        "(tenant.name ILIKE :search OR tenant.slug ILIKE :search)",
        {
          search: `% ${search}% `,
        },
      );
    }

    queryBuilder.orderBy("tenant.createdAt", "DESC").skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        type: t.type,
        status: t.status,
        plan: t.plan || "starter",
        createdAt: t.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getResellerTenantsSummary(resellerId: string): Promise<any[]> {
    const tenants = await this.tenantRepo.find({
      where: { resellerId },
      order: { createdAt: "DESC" },
    });

    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      tenantName: t.name,
      currentPlan: t.plan || "starter",
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
      owner: owner
        ? {
          id: owner.id,
          name: owner.name,
          email: owner.email,
        }
        : null,
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
    const tenant = await this.getTenantById(tenantId);

    const oldPlan = tenant.plan;
    tenant.plan = plan;
    const saved = await this.tenantRepo.save(tenant);

    // Sync subscription limits
    await this.billingService.manualUpdateSubscription(tenant.id, plan, status);

    await this.auditService.logAction(
      "admin",
      "Administrator",
      "UPDATE_TENANT_PLAN",
      `Tenant: ${tenant.name} `,
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
      relations: ["user"],
    });

    if (!membership || !membership.user) {
      const adminMembership = await this.membershipRepo.findOne({
        where: { tenantId },
        relations: ["user"],
        order: { createdAt: "ASC" },
      });

      if (!adminMembership || !adminMembership.user) {
        throw new NotFoundException(
          `No valid user found for tenant ${tenantId}`,
        );
      }
      return adminMembership.user;
    }

    return membership.user;
  }

  async regenerateResellerPassword(
    id: string,
  ): Promise<{ generatedPassword: string }> {
    const user = await this.getTenantOwner(id);

    // 1. Secure Generation
    const generatedPassword = this.generateSecurePassword();
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(generatedPassword, salt);

    // 2. Invalidate Sessions
    user.passwordHash = passwordHash;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await this.userRepo.save(user);

    await this.auditService.logAction(
      "admin",
      "Administrator",
      "REGENERATE_RESELLER_PASSWORD",
      `User: ${user.email} `,
      id,
    );

    return { generatedPassword };
  }

  async deployResellerInstance(
    id: string,
  ): Promise<{ generatedPassword: string }> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException("Reseller not found");

    if (tenant.type !== TenantType.RESELLER) {
      throw new BadRequestException(
        "Instance deployment is restricted to Reseller tenants",
      );
    }

    try {
      return await this.regenerateResellerPassword(id);
    } catch (e) {
      const config = await this.resellerConfigRepo.findOne({
        where: { tenantId: id },
      });
      const email =
        config?.supportEmail ||
        tenant.name.toLowerCase().replace(/\s/g, "") + "@aimstore.in";

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const generatedPassword = this.generateSecurePassword();
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(generatedPassword, salt);

        const user = queryRunner.manager.create(User, {
          email,
          name: tenant.name,
          passwordHash,
          role: UserRole.ADMIN,
          tokenVersion: 1,
        });
        const savedUser = await queryRunner.manager.save(user);

        const membership = queryRunner.manager.create(TenantMembership, {
          userId: savedUser.id,
          tenantId: tenant.id,
          role: TenantRole.OWNER,
          status: "active",
        });
        await queryRunner.manager.save(membership);

        tenant.status = "active";
        await queryRunner.manager.save(tenant);

        await queryRunner.commitTransaction();
        return { generatedPassword };
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(
          "Failed to deploy reseller instance",
        );
      } finally {
        await queryRunner.release();
      }
    }
  }

  async onboardReseller(dto: any): Promise<any> {
    const {
      name,
      email,
      slug,
      planId,
      plan,
      initialCredits,
      maxUsers,
      monthlyMessageLimit,
    } = dto;

    if (slug) {
      const existing = await this.tenantRepo.findOne({ where: { slug } });
      if (existing)
        throw new BadRequestException(`Slug '${slug}' is already in use`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tenant = queryRunner.manager.create(Tenant, {
        name,
        slug: slug || undefined,
        type: TenantType.RESELLER,
        resellerCredits: initialCredits || 0,
        planId: planId || null,
        plan: plan || "platinum",
        maxUsers: maxUsers || 10,
        monthlyMessageLimit: monthlyMessageLimit || 1000,
        status: "active",
        subscriptionStatus: "active",
      });
      const savedTenant = await queryRunner.manager.save(tenant);

      const generatedPassword = this.generateSecurePassword();
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(generatedPassword, salt);

      const user = queryRunner.manager.create(User, {
        email,
        name,
        passwordHash,
        role: UserRole.ADMIN,
        tokenVersion: 1,
      });
      const savedUser = await queryRunner.manager.save(user);

      const membership = queryRunner.manager.create(TenantMembership, {
        userId: savedUser.id,
        tenantId: savedTenant.id,
        role: TenantRole.OWNER,
        status: "active",
      });
      await queryRunner.manager.save(membership);

      const config = queryRunner.manager.create(ResellerConfig, {
        tenantId: savedTenant.id,
        brandName: name,
        supportEmail: email,
      });
      await queryRunner.manager.save(config);

      await queryRunner.commitTransaction();

      this.auditService
        .logAction(
          "admin",
          "Administrator",
          "ONBOARD_RESELLER",
          `Partner: ${name} `,
          savedTenant.id,
          { email, planId, initialCredits },
        )
        .catch((err) => console.error("Failed to log onboarding audit", err));

      return {
        ...savedTenant,
        generatedPassword,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err.code === "23505")
        throw new BadRequestException(
          "Transaction failed: Slug or Email already exists",
        );
      throw new InternalServerErrorException(
        "Failed to onboard reseller: " + err.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateTenantLimits(tenantId: string, dto: any): Promise<Tenant> {
    const tenant = await this.getTenantById(tenantId);

    if (dto.monthlyMessageLimit !== undefined)
      tenant.monthlyMessageLimit = dto.monthlyMessageLimit;
    if (dto.aiCredits !== undefined) tenant.aiCredits = dto.aiCredits;
    if (dto.apiAccessEnabled !== undefined)
      tenant.apiAccessEnabled = dto.apiAccessEnabled;
    if (dto.status !== undefined) tenant.status = dto.status;

    const saved = await this.tenantRepo.save(tenant);

    await this.auditService.logAction(
      "admin",
      "Administrator",
      "UPDATE_TENANT_LIMITS",
      `Tenant: ${tenant.name} `,
      tenant.id,
      dto,
    );

    return saved;
  }

  async updateReseller(id: string, dto: any): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException("Reseller not found");

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.name) tenant.name = dto.name;
      if (dto.slug) tenant.slug = dto.slug;
      if (dto.plan) tenant.plan = dto.plan;
      if (dto.maxUsers !== undefined) tenant.maxUsers = dto.maxUsers;
      if (dto.monthlyMessageLimit !== undefined)
        tenant.monthlyMessageLimit = dto.monthlyMessageLimit;
      if (dto.aiCredits !== undefined) tenant.aiCredits = dto.aiCredits;
      if (dto.status) tenant.status = dto.status;
      if (dto.apiAccessEnabled !== undefined)
        tenant.apiAccessEnabled = dto.apiAccessEnabled;

      const saved = await queryRunner.manager.save(tenant);

      let config = await queryRunner.manager.findOne(ResellerConfig, {
        where: { tenantId: id },
      });
      if (!config)
        config = queryRunner.manager.create(ResellerConfig, { tenantId: id });

      if (dto.brandName) config.brandName = dto.brandName;
      if (dto.supportEmail) config.supportEmail = dto.supportEmail;
      if (dto.primaryColor) config.primaryColor = dto.primaryColor;
      if (dto.logo) config.logo = dto.logo;
      if (dto.domain) config.domain = dto.domain;
      if (dto.theme) config.theme = dto.theme;

      await queryRunner.manager.save(config);
      await queryRunner.commitTransaction();

      this.auditService
        .logAction(
          "admin",
          "Administrator",
          "UPDATE_RESELLER",
          `Partner: ${tenant.name} `,
          tenant.id,
          dto,
        )
        .catch((err) => console.error("Failed to log update audit", err));

      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException("Failed to update reseller");
    } finally {
      await queryRunner.release();
    }
  }
}
