import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { PlatformAdminOnly } from "@shared/decorators/require-role.decorator";
import { AdminHealthService } from "../services/admin-health.service";
import { AdminAnalyticsService } from "../services/admin-analytics.service";
import { AuditService } from "@api/audit/audit.service";

@Controller("admin/platform")
@PlatformAdminOnly()
export class PlatformAdminController {
  constructor(
    private readonly healthService: AdminHealthService,
    private readonly analyticsService: AdminAnalyticsService,
    private readonly auditService: AuditService,
  ) {}

  @Get("stats")
  async getStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get("stats/trends")
  async getTrends(@Query("range") range: string) {
    return this.analyticsService.getAnalyticsTrends(range);
  }

  @Get("alerts")
  async getAlerts() {
    return this.analyticsService.getSystemAlerts();
  }

  @Get("health")
  async getHealth() {
    const health = await this.healthService.checkSystemHealth();
    return {
      status: "healthy",
      checks: health,
      timestamp: new Date(),
      version: "1.0.0",
    };
  }

  @Get("system-logs")
  async getLogs() {
    return this.healthService.getSystemLogs();
  }

  @Get("audit-logs")
  async getAuditLogs(@Query("limit") limit: number = 100) {
    return this.auditService.getLogs(limit);
  }
}
