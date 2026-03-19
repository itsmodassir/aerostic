import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User } from "@shared/database/entities/core/user.entity";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { TenantMembership } from "@shared/database/entities/core/tenant-membership.entity";
import { AuditLog } from "@shared/database/entities/core/audit-log.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Tenant, TenantMembership, AuditLog])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
