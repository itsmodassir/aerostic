import { Body, Controller, Get, Post, Query, Param } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
export class CampaignsController {
    constructor(private readonly campaignsService: CampaignsService) { }

    @Post()
    create(@Body() body: any) {
        return this.campaignsService.create(body.tenantId, body.name);
    }

    @Get()
    findAll(@Query('tenantId') tenantId: string) {
        return this.campaignsService.findAll(tenantId);
    }

    @Post(':id/send')
    send(@Param('id') id: string, @Body() body: any) {
        return this.campaignsService.dispatch(body.tenantId, id);
    }
}
