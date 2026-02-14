import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto/workflow.dto';

@Controller('workflows')
@UseGuards(JwtAuthGuard, TenantGuard)
export class WorkflowsController {
    constructor(private readonly workflowsService: WorkflowsService) { }

    @Post()
    create(@Req() req: any, @Body() data: CreateWorkflowDto) {
        return this.workflowsService.create(req.tenant.id, data);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.workflowsService.findAll(req.tenant.id);
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.workflowsService.findOne(id, req.tenant.id);
    }

    @Put(':id')
    update(@Req() req: any, @Param('id') id: string, @Body() data: UpdateWorkflowDto) {
        return this.workflowsService.update(id, req.tenant.id, data);
    }

    @Delete(':id')
    delete(@Req() req: any, @Param('id') id: string) {
        return this.workflowsService.delete(id, req.tenant.id);
    }
}
