import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserTenant } from '../auth/decorators/user-tenant.decorator';

@Controller('automation')
@UseGuards(JwtAuthGuard)
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('rules')
  createRule(@UserTenant() tenantId: string, @Body() body: any) {
    return this.automationService.createRule(tenantId, body);
  }

  @Get('rules')
  getRules(@UserTenant() tenantId: string) {
    return this.automationService.getRules(tenantId);
  }

  @Post('execute')
  async execute() {
    // Internal Dispatcher Call for Rule Execution
    console.log('Automation Execute triggered');
    return { status: 'executed' };
  }
}
