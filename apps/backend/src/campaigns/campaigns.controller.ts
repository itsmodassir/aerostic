import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { UserTenant } from '../auth/decorators/user-tenant.decorator';

@Controller('campaigns')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) { }

  @Post()
  @Permissions('campaigns:create')
  create(@UserTenant() tenantId: string, @Body() body: any) {
    return this.campaignsService.create(tenantId, body.name);
  }

  @Get()
  @Permissions('campaigns:read')
  findAll(@UserTenant() tenantId: string) {
    return this.campaignsService.findAll(tenantId);
  }

  @Post(':id/send')
  @Permissions('campaigns:send')
  send(@UserTenant() tenantId: string, @Param('id') id: string) {
    return this.campaignsService.dispatch(tenantId, id);
  }
}
