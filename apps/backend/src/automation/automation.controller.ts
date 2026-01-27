import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AutomationService } from './automation.service';

@Controller('automation')
export class AutomationController {
    constructor(private readonly automationService: AutomationService) { }

    @Post('rules')
    createRule(@Body() body: any) {
        return this.automationService.createRule(body.tenantId, body);
    }

    @Get('rules')
    getRules(@Query('tenantId') tenantId: string) {
        return this.automationService.getRules(tenantId);
    }
    @Post('execute')
    async execute(@Body() body: any) {
        // Internal Dispatcher Call for Rule Execution
        console.log('Automation Execute triggered internally');
        return { status: 'executed' };
    }
}
