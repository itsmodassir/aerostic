import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "../../redis.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TenantMembership } from "@shared/database/entities/core/tenant-membership.entity";
import { ApiKey } from "@shared/database/entities/core/api-key.entity";
import { Subscription } from "@shared/database/entities/billing/subscription.entity";
import { PolicyEntity } from "@shared/database/entities/core/policy.entity";

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
    const membership = await this.membershipRepo.findOne({
      where: { userId: subjectId },
      relations: ["tenant"],
    });

    if (!membership) return null;

    const subscription = await this.subscriptionRepo.findOne({
      where: { tenantId: membership.tenantId },
    });

    // 3️⃣ Resolve policies into permissions array
    const policies = await this.policyRepo.find({
      where: [
        { subjectType: "role", subject: membership.role, isActive: true },
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
      role: membership.role,
      permissions,
      tenantId: membership.tenantId,
      subscriptionStatus: subscription?.status || "inactive",
      riskScore: 0,
    };
  }
}
