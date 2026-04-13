import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "../../redis.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TenantMembership } from "@shared/database/entities/core/tenant-membership.entity";
import { ApiKey } from "@shared/database/entities/core/api-key.entity";
import { Subscription } from "@shared/database/entities/billing/subscription.entity";
import { PolicyEntity } from "@shared/database/entities/core/policy.entity";
import { User, UserRole } from "@shared/database/entities/core/user.entity";
import { TenantType } from "@shared/database/entities/core/tenant.entity";
import { SystemRole } from "@shared/types/roles";
import { TenantRole } from "@shared/database/entities/core/tenant-membership.entity";

@Injectable()
export class AuthzCacheService {
  private readonly logger = new Logger(AuthzCacheService.name);
  private TTL = 900; // 15 minutes

  constructor(
    private redisService: RedisService,
    @InjectRepository(TenantMembership)
    private membershipRepo: Repository<TenantMembership>,
    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(PolicyEntity)
    private policyRepo: Repository<PolicyEntity>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getAuthContext(subjectId: string, tenantId?: string): Promise<any> {
    const contextSlug = tenantId || "global";
    const cacheKey = `authz:${subjectId}:${contextSlug}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const resolved = await this.resolveFromDatabase(subjectId, tenantId);
    if (!resolved) return null;

    await this.redisService.set(cacheKey, JSON.stringify(resolved), this.TTL);

    return resolved;
  }


  async invalidate(subjectId: string) {
    await this.redisService.del(`authz:${subjectId}`);
  }

  private async resolveFromDatabase(subjectId: string, requestTenantId?: string): Promise<any> {
    // 1️⃣ Check if it's API Key
    const apiKey = await this.apiKeyRepo.findOne({
      where: { id: subjectId },
    });

    if (apiKey) {
      return {
        role: "api_key",
        systemRole: SystemRole.AGENT,
        permissions: apiKey.permissions || [],
        tenantId: apiKey.tenantId,
        subscriptionStatus: "active",
        riskScore: apiKey.riskScore || 0,
      };
    }

    // 2️⃣ Otherwise User
    const user = await this.userRepo.findOne({
      where: { id: subjectId },
    });

    if (!user) return null;

    let membership = null;
    let effectiveTenantId = null;

    // Only look up membership if they aren't operating as a platform admin OR if they specified a tenant
    if (requestTenantId) {
       membership = await this.membershipRepo.findOne({
          where: { userId: subjectId, tenantId: requestTenantId },
          relations: ["tenant", "roleEntity", "roleEntity.rolePermissions", "roleEntity.rolePermissions.permission"],
       });
       effectiveTenantId = requestTenantId;
    } else {
       // Fallback to primary membership if no tenantId provided
       membership = await this.membershipRepo.findOne({
          where: { userId: subjectId, status: "active" },
          relations: ["tenant", "roleEntity", "roleEntity.rolePermissions", "roleEntity.rolePermissions.permission"],
          order: { createdAt: "ASC" },
       });
       effectiveTenantId = membership?.tenantId || null;
    }

    // Derive SystemRole
    let systemRole = SystemRole.AGENT;
    if (user.role === UserRole.SUPER_ADMIN) {
      systemRole = SystemRole.SUPER_ADMIN;
    } else if (user.role === UserRole.ADMIN && (!membership || membership.tenant?.type !== TenantType.RESELLER)) {
      systemRole = SystemRole.PLATFORM_ADMIN;
    } else if (membership) {
      const isOwnerOrAdmin = membership.role === TenantRole.OWNER || membership.role === TenantRole.ADMIN;
      if (membership.tenant.type === TenantType.RESELLER) {
         systemRole = isOwnerOrAdmin ? SystemRole.RESELLER_ADMIN : SystemRole.AGENT;
      } else {
         systemRole = isOwnerOrAdmin ? SystemRole.TENANT_ADMIN : SystemRole.AGENT;
      }
    }

    const effectiveRole = user?.role === UserRole.SUPER_ADMIN ? UserRole.SUPER_ADMIN : membership?.role;

    const subscription = effectiveTenantId ? await this.subscriptionRepo.findOne({
      where: { tenantId: effectiveTenantId },
    }) : null;

    // 3️⃣ Resolve policies into permissions array
    const policies = await this.policyRepo.find({
      where: [
        { subjectType: "role", subject: effectiveRole as string, isActive: true },
        { subjectType: "user", subject: subjectId, isActive: true },
      ],
    });

    const permissions: string[] = [];
    policies.forEach((p) => {
      p.actions.forEach((action) => {
        permissions.push(`${p.resource}:${action}`);
      });
    });

    // Merge roleEntity permissions (from Role table)
    if (membership?.roleEntity?.rolePermissions) {
       membership.roleEntity.rolePermissions.forEach((rp: any) => {
          if (rp.permission) {
             permissions.push(`${rp.permission.resource}:${rp.permission.action}`);
          }
       });
    }

    return {
      role: effectiveRole,
      systemRole,
      permissions,
      tenantId: effectiveTenantId,
      subscriptionStatus: subscription?.status || (systemRole === SystemRole.SUPER_ADMIN || systemRole === SystemRole.PLATFORM_ADMIN ? "active" : "inactive"),
      riskScore: 0,
    };
  }

}
