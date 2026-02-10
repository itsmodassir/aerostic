import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { EncryptionService } from './encryption.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantMembership } from '../tenants/entities/tenant-membership.entity';
import { Role } from '../tenants/entities/role.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, TenantMembership, Role]),
  ],
  providers: [RedisService, EncryptionService],
  exports: [RedisService, EncryptionService, TypeOrmModule],
})
export class CommonModule { }
