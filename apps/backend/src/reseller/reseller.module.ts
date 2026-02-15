import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResellerService } from './reseller.service';
import { ResellerController } from './reseller.controller';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { Plan } from '../billing/entities/plan.entity';
import { ResellerConfig } from '../tenants/entities/reseller-config.entity';
import { TenantMembership } from '../tenants/entities/tenant-membership.entity';
import { Role } from '../tenants/entities/role.entity';
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';

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
export class ResellerModule { }
