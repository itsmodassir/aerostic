import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';
import { EncryptionService } from './encryption.service';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantMembership } from '../tenants/entities/tenant-membership.entity';
import { Role } from '../tenants/entities/role.entity';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Tenant, TenantMembership, Role])
  ],
  providers: [RedisService, EncryptionService, MailService],
  exports: [RedisService, EncryptionService, MailService, TypeOrmModule],
})
export class CommonModule { }
