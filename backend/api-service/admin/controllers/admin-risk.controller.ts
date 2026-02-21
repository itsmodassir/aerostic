import { Controller, Get, Post, Body, Query, Param } from "@nestjs/common";
import { PlatformAdminOnly } from "@shared/decorators/require-role.decorator";
import { AdminRiskService } from "../services/admin-risk.service";

@Controller("admin/risk")
@PlatformAdminOnly()
export class AdminRiskController {
  constructor(private readonly riskService: AdminRiskService) {}

  @Get("platform")
  async getPlatformOverview() {
    return this.riskService.getPlatformOverview();
  }

  @Get("tenants")
  async getHighRiskTenants(@Query("limit") limit: number) {
    return this.riskService.getHighRiskTenants(limit);
  }

  @Get("events")
  async getRecentSecurityEvents(@Query("limit") limit: number) {
    return this.riskService.getRecentSecurityEvents(limit);
  }

  @Get("clusters")
  async getActiveClusters() {
    return this.riskService.getActiveClusters();
  }

  @Get("clusters/heatmap")
  async getClusterHeatmap(@Query("hours") hours: number) {
    return this.riskService.getClusterHeatmap(hours || 24);
  }

  @Get("trends")
  async getRiskTrends(@Query("hours") hours: number) {
    return this.riskService.getHistoricalTrends(hours);
  }

  @Post("tenants/:id/override")
  async overrideRisk(
    @Param("id") tenantId: string,
    @Body() body: { score: number; reason: string },
  ) {
    return this.riskService.overrideRiskScore(
      tenantId,
      body.score,
      body.reason,
    );
  }
}
