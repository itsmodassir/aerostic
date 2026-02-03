import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('overview')
    getOverview(@Req() req: any) {
        const tenantId = req.user.tenantId;
        return this.analyticsService.getOverview(tenantId);
    }
}
