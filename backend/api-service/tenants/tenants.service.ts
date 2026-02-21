import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import {
  TenantMembership,
  TenantRole,
} from "@shared/database/entities/core/tenant-membership.entity";
import { Role } from "@shared/database/entities/core/role.entity";
import { RedisService } from "@shared/redis.service";
import { Permission } from "@shared/database/entities/core/permission.entity";
import { RolePermission } from "@shared/database/entities/core/role-permission.entity";

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(TenantMembership)
    private membershipRepository: Repository<TenantMembership>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    private redisService: RedisService,
  ) {}

  async create(
    createTenantDto: CreateTenantDto,
    userId: string,
  ): Promise<Tenant> {
    const slug = createTenantDto.slug || this.slugify(createTenantDto.name);

    // Check if slug exists
    const existing = await this.tenantsRepository.findOne({ where: { slug } });
    if (existing) {
      throw new BadRequestException("Workspace with this name already exists");
    }

    const tenant = this.tenantsRepository.create({
      ...createTenantDto,
      slug,
      subscriptionStatus: "trialing",
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    const savedTenant = await this.tenantsRepository.save(tenant);

    // Create membership for the creator (Owner)
    const ownerRole = await this.roleRepository.findOne({
      where: { name: "owner" },
    });

    const membership = this.membershipRepository.create({
      userId,
      tenantId: savedTenant.id,
      role: TenantRole.OWNER,
      roleId: ownerRole?.id,
      status: "active",
    });

    await this.membershipRepository.save(membership);

    return savedTenant;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async findByName(name: string): Promise<Tenant | null> {
    return this.tenantsRepository.findOneBy({ name });
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenantsRepository.findOneBy({ slug });
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantsRepository.find();
  }

  async findAllSubTenants(resellerId: string): Promise<Tenant[]> {
    return this.tenantsRepository.find({ where: { resellerId } });
  }

  /**
   * Fetches and caches permissions for a user within a specific tenant
   */
  async getPermissions(userId: string, tenantId: string): Promise<string[]> {
    const cacheKey = `perms:${userId}:${tenantId}`;

    // 1. Try Cache
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. Fetch from DB
    const membership = await this.membershipRepository.findOne({
      where: { userId, tenantId, status: "active" },
      relations: [
        "roleEntity",
        "roleEntity.rolePermissions",
        "roleEntity.rolePermissions.permission",
      ],
    });

    if (!membership || !membership.roleEntity) {
      return [];
    }

    const permissions = membership.roleEntity.rolePermissions.map(
      (rp) => `${rp.permission.resource}:${rp.permission.action}`,
    );

    // 3. Store in Cache (5 min TTL)
    await this.redisService.set(cacheKey, JSON.stringify(permissions), 300);

    return permissions;
  }
}
