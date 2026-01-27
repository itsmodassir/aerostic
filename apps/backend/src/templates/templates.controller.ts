import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { TemplatesService } from './templates.service';

@Controller('templates')
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) { }

    @Get()
    findAll(@Query('tenantId') tenantId: string) {
        return this.templatesService.findAll(tenantId);
    }

    @Post('sync')
    sync(@Body() body: { tenantId: string }) {
        return this.templatesService.sync(body.tenantId);
    }
}
