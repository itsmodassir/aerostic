import { Injectable, Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { TenantsService } from "../../../api-service/tenants/tenants.service";
import { PolicyEntity } from "../../database/entities/core/policy.entity";
import { CompiledAuthzState } from "../interfaces/authorization-context.interface";

@Injectable()
export class PermissionResolverService {
  private readonly logger = new Logger(PermissionResolverService.name);

  constructor(
    @InjectRepository(PolicyEntity)
    private policyRepo: Repository<PolicyEntity>,
    private tenantsService: TenantsService,
  ) {}

  async resolve(
    userId: string,
    tenantId: string,
    subjectType: "user" | "api_key" = "user",
    role?: string,
  ): Promise<CompiledAuthzState> {
    this.logger.debug(
      `Resolving permissions for ${subjectType} ${userId} on tenant ${tenantId}`,
    );

    const tenant = await this.tenantsService.findOne(tenantId);

    // Fetch policies for the role, user, and potentially active API keys
    const where: any[] = [
      { subjectType: "role", subject: role, isActive: true },
      { subjectType, subject: userId, isActive: true },
    ];

    const policies = await this.policyRepo.find({ where });

    const permissions: string[] = [];
    policies.forEach((p) => {
      p.actions.forEach((action) => {
        permissions.push(`${p.resource}:${action}`);
      });
    });

    let resellerScope: string[] = [];
    if (role === "reseller_admin") {
      const subTenants = await this.tenantsService.findAllSubTenants(tenantId);
      resellerScope = subTenants.map((t) => t.id);
      // Also include self
      resellerScope.push(tenantId);
    }

    return {
      userId,
      tenantId,
      role: role || "user",
      permissions,
      resellerScope,
      riskScore: 0,
      plan: tenant?.plan || "starter",
      subscriptionStatus: tenant?.status || "active",
    };
  }
}
