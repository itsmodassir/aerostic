import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "../../redis.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TenantMembership } from "@shared/database/entities/core/tenant-membership.entity";
import { ApiKey } from "@shared/database/entities/core/api-key.entity";
import { Subscription } from "@shared/database/entities/billing/subscription.entity";
import { PolicyEntity } from "@shared/database/entities/core/policy.entity";
import { User, UserRole } from "@shared/database/entities/core/user.entity";

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

  async getAuthContext(subjectId: string): Promise<any> {
    const cacheKey = `authz:${subjectId}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const resolved = await this.resolveFromDatabase(subjectId);
    if (!resolved) return null;

    await this.redisService.set(cacheKey, JSON.stringify(resolved), this.TTL);

    return resolved;
  }

  async invalidate(subjectId: string) {
    await this.redisService.del(`authz:${subjectId}`);
  }

  private async resolveFromDatabase(subjectId: string): Promise<any> {
    // 1️⃣ Check if it's API Key
    const apiKey = await this.apiKeyRepo.findOne({
      where: { id: subjectId },
    });

    if (apiKey) {
      return {
        role: "api_key",
        permissions: apiKey.permissions || [],
        tenantId: apiKey.tenantId,
        subscriptionStatus: "active",
        riskScore: apiKey.riskScore || 0,
      };
    }

    // 2️⃣ Otherwise User
    const [membership, user] = await Promise.all([
      this.membershipRepo.findOne({
        where: { userId: subjectId },
        relations: ["tenant"],
      }),
      this.userRepo.findOne({
        where: { id: subjectId },
      }),
    ]);
  
    if (!membership && !user) return null;
  
    // Use global super_admin role as priority
    const effectiveRole = user?.role === UserRole.SUPER_ADMIN ? UserRole.SUPER_ADMIN : membership?.role;
    const effectiveTenantId = membership?.tenantId || (user?.role === UserRole.SUPER_ADMIN ? null : null);

    const subscription = membership?.tenantId ? await this.subscriptionRepo.findOne({
      where: { tenantId: membership.tenantId },
    }) : null;

    // 3️⃣ Resolve policies into permissions array
    const policies = await this.policyRepo.find({
      where: [
        { subjectType: "role", subject: effectiveRole, isActive: true },
        { subjectType: "user", subject: subjectId, isActive: true },
      ],
    });

    const permissions: string[] = [];
    policies.forEach((p) => {
      p.actions.forEach((action) => {
        permissions.push(`${p.resource}:${action}`);
      });
    });

    return {
      role: effectiveRole,
      permissions,
      tenantId: effectiveTenantId,
      subscriptionStatus: subscription?.status || (effectiveRole === UserRole.SUPER_ADMIN ? "active" : "inactive"),
      riskScore: 0,
    };
  }
}
