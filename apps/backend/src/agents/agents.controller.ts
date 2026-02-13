import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AgentsService } from './agents.service';

@Controller('agents')
export class AgentsController {
    constructor(private readonly agentsService: AgentsService) { }

    @Post()
    create(@Body() createAgentDto: any) {
        // Assuming tenantId is passed in body for now, or extracted from user context
        const { tenantId, ...data } = createAgentDto;
        return this.agentsService.create(tenantId, data);
    }

    @Get()
    findAll(@Query('tenantId') tenantId: string) {
        return this.agentsService.findAll(tenantId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Query('tenantId') tenantId: string) {
        return this.agentsService.findOne(id, tenantId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAgentDto: any) {
        const { tenantId, ...data } = updateAgentDto;
        return this.agentsService.update(id, tenantId, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Query('tenantId') tenantId: string) {
        return this.agentsService.remove(id, tenantId);
    }
}
