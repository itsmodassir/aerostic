import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Tenant,
  TenantType,
} from "@shared/database/entities/core/tenant.entity";
import { User, UserRole } from "@shared/database/entities/core/user.entity";
import { Plan } from "@shared/database/entities/billing/plan.entity";
import { ResellerConfig } from "@shared/database/entities/core/reseller-config.entity";
import { CreateResellerDto } from "./dto/create-reseller.dto";
import { OnboardSubTenantDto } from "./dto/onboard-sub-tenant.dto";
import { UpdateBrandingDto } from "./dto/update-branding.dto";
import { UsersService } from "../users/users.service";
import { TenantsService } from "../tenants/tenants.service";
import {
  TenantMembership,
  TenantRole,
} from "@shared/database/entities/core/tenant-membership.entity";
import { RedisService } from "@shared/redis.service";

@Injectable()
export class ResellerService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>,
    @InjectRepository(ResellerConfig)
    private configRepository: Repository<ResellerConfig>,
    @InjectRepository(TenantMembership)
    private membershipRepository: Repository<TenantMembership>,
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private redisService: RedisService,
  ) { }

  async getStats(resellerId: string) {
    const reseller = await this.tenantsRepository.findOne({
      where: { id: resellerId },
    });

    if (!reseller) throw new NotFoundException("Reseller not found");
    if (reseller.type !== TenantType.RESELLER) {
      throw new BadRequestException("Tenant is not a reseller");
    }

    const [clients, count] = await this.tenantsRepository.findAndCount({
      where: { resellerId },
    });

    const activeClients = clients.filter((c) => c.status === "active").length;
    const totalDistributedCredits = clients.reduce(
      (sum, c) => sum + (c.resellerCredits || 0),
      0,
    );

    return {
      totalClients: count,
      activeClients,
      inactiveClients: count - activeClients,
      availableCredits: reseller.resellerCredits,
      totalDistributedCredits,
    };
  }

  async createReseller(dto: CreateResellerDto) {
    // 1. Check if user exists
    const existingUser = await this.usersService.findOneByEmail(dto.ownerEmail);
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // 2. Validate Plan
    const plan = await this.plansRepository.findOne({
      where: { id: dto.planId },
    });
    if (!plan) {
      throw new NotFoundException("Selected plan not found");
    }

    // 3. Create Reseller Tenant
    const tenant = this.tenantsRepository.create({
      name: dto.name,
      type: TenantType.RESELLER,
      planId: plan.id,
      slug: this.slugify(dto.name),
    });
    const savedTenant = await this.tenantsRepository.save(tenant);

    // 4. Create Owner User
    const owner = await this.usersService.create({
      email: dto.ownerEmail,
      name: dto.ownerName,
      password: dto.password || "TemporaryPass123!", // Should ideally send invite email
      role: UserRole.ADMIN,
    });

    // 5. Create Membership
    await this.membershipRepository.save(
      this.membershipRepository.create({
        userId: owner.id,
        tenantId: savedTenant.id,
        role: TenantRole.OWNER,
        status: "active",
      }),
    );

    // 6. Create Default Reseller Config
    const config = this.configRepository.create({
      tenantId: savedTenant.id,
      brandName: dto.name,
    });
    await this.configRepository.save(config);

    return { tenant: savedTenant, owner };
  }

  async onboardSubTenant(resellerId: string, dto: OnboardSubTenantDto) {
    const reseller = await this.tenantsRepository.findOne({
      where: { id: resellerId },
      relations: ["planRelation"],
    });

    if (!reseller || reseller.type !== TenantType.RESELLER) {
      throw new BadRequestException("Invalid reseller");
    }

    // Check limits
    const subTenantCount = await this.tenantsRepository.count({
      where: { resellerId },
    });

    if (
      reseller.planRelation &&
      subTenantCount >= (reseller.planRelation as any).maxSubTenants
    ) {
      throw new BadRequestException(
        "Max sub-tenants limit reached for your plan",
      );
    }

    // 1. Create Sub-Tenant
    const tenant = this.tenantsRepository.create({
      name: dto.name,
      type: TenantType.REGULAR,
      resellerId: reseller.id,
      slug: this.slugify(dto.name),
    });
    const savedTenant = await this.tenantsRepository.save(tenant);

    // 2. Create Owner User for Sub-Tenant
    const user = await this.usersService.create({
      email: dto.ownerEmail,
      name: dto.ownerName,
      password: dto.password || "ClientPass123!",
      role: UserRole.USER,
    });

    // 3. Create Membership
    await this.membershipRepository.save(
      this.membershipRepository.create({
        userId: user.id,
        tenantId: savedTenant.id,
        role: TenantRole.OWNER,
        status: "active",
      }),
    );

    // Clear reseller scope cache
    await this.redisService.del(`reseller:${resellerId}:scope`);

    return savedTenant;
  }

  async updateBranding(tenantId: string, dto: UpdateBrandingDto) {
    let config = await this.configRepository.findOne({ where: { tenantId } });
    if (!config) {
      config = this.configRepository.create({ tenantId });
    }

    Object.assign(config, dto);
    return this.configRepository.save(config);
  }

  async allocateCredits(
    resellerId: string,
    targetTenantId: string,
    amount: number,
  ) {
    const normalizedAmount = Number(amount);
    if (
      !Number.isFinite(normalizedAmount) ||
      normalizedAmount <= 0 ||
      !Number.isInteger(normalizedAmount)
    ) {
      throw new BadRequestException("Amount must be a positive integer");
    }

    const reseller = await this.tenantsRepository.findOne({
      where: { id: resellerId },
    });
    const target = await this.tenantsRepository.findOne({
      where: { id: targetTenantId },
    });

    if (!reseller || !target) throw new NotFoundException("Tenant not found");
    if (reseller.type !== TenantType.RESELLER) {
      throw new BadRequestException("Invalid reseller");
    }
    if (target.resellerId !== resellerId)
      throw new BadRequestException("Tenant does not belong to this reseller");

    if (reseller.resellerCredits < normalizedAmount)
      throw new BadRequestException("Insufficient credits");

    reseller.resellerCredits -= normalizedAmount;
    target.resellerCredits = (target.resellerCredits || 0) + normalizedAmount;

    await this.tenantsRepository.save([reseller, target]);
    return { success: true, remainingCredits: reseller.resellerCredits };
  }

  async listSubTenants(resellerId: string) {
    return this.tenantsRepository.find({
      where: { resellerId },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Fetches and caches the IDs of all sub-tenants belonging to a reseller
   */
  async getResellerScope(resellerId: string): Promise<string[]> {
    const cacheKey = `reseller:${resellerId}:scope`;

    // 1. Try Cache
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. Fetch from DB
    const subTenants = await this.tenantsRepository.find({
      where: { resellerId },
      select: ["id"],
    });

    const scope = subTenants.map((t) => t.id);

    // 3. Store in Cache (1 hour TTL - scope is relatively stable)
    await this.redisService.set(cacheKey, JSON.stringify(scope), 3600);

    return scope;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
