import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { WorkflowRunnerService } from './workflow-runner.service';
import { WorkflowExecutionService } from './workflow-execution.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto/workflow.dto';

@Controller('workflows')
@UseGuards(JwtAuthGuard, TenantGuard)
export class WorkflowsController {
    constructor(
        private readonly workflowsService: WorkflowsService,
        private readonly workflowRunner: WorkflowRunnerService,
        private readonly executionService: WorkflowExecutionService,
    ) { }

    @Post(':id/execute')
    async execute(@Req() req: any, @Param('id') id: string, @Body() body: any) {
        return this.workflowRunner.executeWorkflow(id, req.tenant.id, body || {});
    }

    @Get(':id/executions')
    async getExecutions(@Req() req: any, @Param('id') id: string) {
        return this.executionService.findExecutionsByWorkflow(id, req.tenant.id);
    }

    @Get('executions/:executionId')
    async getExecutionDetails(@Req() req: any, @Param('executionId') executionId: string) {
        return this.executionService.findOne(executionId, req.tenant.id);
    }

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
