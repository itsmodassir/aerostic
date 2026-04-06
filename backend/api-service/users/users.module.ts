import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User } from "@shared/database/entities/core/user.entity";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { TenantMembership } from "@shared/database/entities/core/tenant-membership.entity";
import { AuditLog } from "@shared/database/entities/core/audit-log.entity";
import { AuthzCacheService } from "@shared/authorization/cache/authz-cache.service";
import { ApiKey } from "@shared/database/entities/core/api-key.entity";
import { Subscription } from "@shared/database/entities/billing/subscription.entity";
import { PolicyEntity } from "@shared/database/entities/core/policy.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Tenant,
      TenantMembership,
      AuditLog,
      ApiKey,
      Subscription,
      PolicyEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthzCacheService],
  exports: [UsersService],
})
export class UsersModule {}
