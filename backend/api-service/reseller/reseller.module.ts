import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ResellerService } from "./reseller.service";
import { ResellerController } from "./reseller.controller";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { User } from "@shared/database/entities/core/user.entity";
import { Plan } from "@shared/database/entities/billing/plan.entity";
import { ResellerConfig } from "@shared/database/entities/core/reseller-config.entity";
import { TenantMembership } from "@shared/database/entities/core/tenant-membership.entity";
import { Role } from "@shared/database/entities/core/role.entity";
import { UsersModule } from "../users/users.module";
import { TenantsModule } from "../tenants/tenants.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      User,
      Plan,
      ResellerConfig,
      TenantMembership,
      Role,
    ]),
    UsersModule,
    TenantsModule,
  ],
  controllers: [ResellerController],
  providers: [ResellerService],
  exports: [ResellerService],
})
export class ResellerModule {}
