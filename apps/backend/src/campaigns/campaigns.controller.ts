import { Body, Controller, Get, Post, Query, Param, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserTenant } from '../auth/decorators/user-tenant.decorator';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
    constructor(private readonly campaignsService: CampaignsService) { }

    @Post()
    create(@UserTenant() tenantId: string, @Body() body: any) {
        return this.campaignsService.create(tenantId, body.name);
    }

    @Get()
    findAll(@UserTenant() tenantId: string) {
        return this.campaignsService.findAll(tenantId);
    }

    @Post(':id/send')
    send(@UserTenant() tenantId: string, @Param('id') id: string) {
        return this.campaignsService.dispatch(tenantId, id);
    }
}
