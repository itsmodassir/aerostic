import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PolicyEntity } from "../database/entities/core/policy.entity";
import { PolicyEngineService } from "./engine/policy-engine.service";
import { PermissionResolverService } from "./engine/permission-resolver.service";
import { ConditionEvaluatorService } from "./engine/condition-evaluator.service";
import { ScopeEvaluatorService } from "./engine/scope-evaluator.service";
import { AuthzCacheService } from "./cache/authz-cache.service";
import { AuthorizationGuard } from "./guards/authorization.guard";
import { TenantsModule } from "../../api-service/tenants/tenants.module";
import { TenantMembership } from "@shared/database/entities/core/tenant-membership.entity";
import { ApiKey } from "@shared/database/entities/core/api-key.entity";
import { Subscription } from "@shared/database/entities/billing/subscription.entity";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PolicyEntity,
      TenantMembership,
      ApiKey,
      Subscription,
    ]),
    TenantsModule,
  ],
  providers: [
    AuthzCacheService,
    PermissionResolverService,
    ConditionEvaluatorService,
    ScopeEvaluatorService,
    PolicyEngineService,
    AuthorizationGuard,
  ],
  exports: [AuthzCacheService, PolicyEngineService, AuthorizationGuard],
})
export class AuthorizationModule {}
