import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TenantsService } from "./tenants.service";
import { TenantsController } from "./tenants.controller";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { TenantMembership } from "@shared/database/entities/core/tenant-membership.entity";
import { Role } from "@shared/database/entities/core/role.entity";
import { Permission } from "@shared/database/entities/core/permission.entity";
import { RolePermission } from "@shared/database/entities/core/role-permission.entity";
import { AuditModule } from "../audit/audit.module";
import { PermissionsGuard } from "@shared/guards/permissions.guard";

// Resolve TypeScript module resolution issues

import { Domain } from "@shared/database/entities/core/domain.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      TenantMembership,
      Role,
      Permission,
      RolePermission,
      Domain,
    ]),
    AuditModule,
  ],
  controllers: [TenantsController],
  providers: [TenantsService, PermissionsGuard],
  exports: [TenantsService, PermissionsGuard],
})
export class TenantsModule {}
