import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserTenant } from '../auth/decorators/user-tenant.decorator';

import { WorkflowsService } from './workflows.service';

@Controller('automation')
@UseGuards(JwtAuthGuard)
export class AutomationController {
  constructor(
    private readonly automationService: AutomationService,
    private readonly workflowsService: WorkflowsService,
  ) { }

  @Post('rules')
  createRule(@UserTenant() tenantId: string, @Body() body: any) {
    return this.automationService.createRule(tenantId, body);
  }

  @Get('rules')
  getRules(@UserTenant() tenantId: string) {
    return this.automationService.getRules(tenantId);
  }

  @Post('test-execute')
  async executeTest(@UserTenant() tenantId: string, @Body() body: { workflowId: string, message: string }) {
    await this.workflowsService.executeTest(tenantId, body.workflowId, body.message);
    return { status: 'test_started' };
  }

  @Post('broadcast')
  async executeBroadcast(@UserTenant() tenantId: string, @Body() body: { workflowId: string, audience: any[] }) {
    await this.workflowsService.executeBroadcast(tenantId, body.workflowId, body.audience);
    return { status: 'broadcast_started', count: body.audience.length };
  }
}
