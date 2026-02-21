import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthorizationContext } from "../interfaces/authorization-context.interface";
import { Decision } from "../interfaces/decision.interface";
import { AuthzCacheService } from "../cache/authz-cache.service";
import { PolicyEntity } from "../../database/entities/core/policy.entity";

@Injectable()
export class PolicyEngineService {
  private readonly logger = new Logger(PolicyEngineService.name);

  constructor(
    @InjectRepository(PolicyEntity)
    private policyRepo: Repository<PolicyEntity>,
    private cacheService: AuthzCacheService,
  ) {}

  async evaluate(context: AuthorizationContext): Promise<Decision> {
    const { user, apiKey, resource, action, tenantId } = context;

    // 1️⃣ Load resolved auth context from Redis
    const authContext = await this.cacheService.getAuthContext(
      user?.id || user?.sub || apiKey?.id,
    );

    if (!authContext) {
      return { allowed: false, reason: "No authorization context" };
    }

    // 2️⃣ Super Admin bypass
    if (authContext.role === "super_admin") {
      return { allowed: true };
    }

    // 3️⃣ Wildcard support
    const requestedPermission = `${resource}:${action}`;

    if (
      authContext.permissions.includes("*:*") ||
      authContext.permissions.includes(`${resource}:*`) ||
      authContext.permissions.includes(requestedPermission)
    ) {
      // 4️⃣ Conditional checks
      const conditionResult = await this.evaluateConditions(
        authContext,
        context,
      );
      if (!conditionResult.allowed) {
        return conditionResult;
      }

      return { allowed: true };
    }

    return { allowed: false, reason: "Permission denied" };
  }

  private async evaluateConditions(
    authContext: any,
    context: AuthorizationContext,
  ): Promise<Decision> {
    // Subscription enforcement
    if (authContext.subscriptionStatus !== "active") {
      return { allowed: false, reason: "Subscription inactive" };
    }

    // Risk-based enforcement
    if (authContext.riskScore > 80) {
      return {
        allowed: false,
        reason: "High risk user temporarily restricted",
      };
    }

    return { allowed: true };
  }
}
