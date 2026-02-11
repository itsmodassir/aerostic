import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantMembership } from '../tenants/entities/tenant-membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Tenant, TenantMembership])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
