import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserTenant } from '../auth/decorators/user-tenant.decorator';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll(@UserTenant() tenantId: string) {
    return this.templatesService.findAll(tenantId);
  }

  @Post('sync')
  sync(@UserTenant() tenantId: string) {
    return this.templatesService.sync(tenantId);
  }
}
