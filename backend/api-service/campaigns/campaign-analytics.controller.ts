import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { CampaignAnalyticsService } from "./campaign-analytics.service";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";

@Controller("campaigns/:id/analytics")
@UseGuards(JwtAuthGuard)
export class CampaignAnalyticsController {
  constructor(private readonly analyticsService: CampaignAnalyticsService) {}

  @Get()
  async getStats(
    @Param("id") id: string,
    @UserTenant() tenantId: string
  ) {
    return this.analyticsService.getCampaignStats(id, tenantId);
  }

  @Get("timeline")
  async getTimeline(
    @Param("id") id: string,
    @UserTenant() tenantId: string
  ) {
    return this.analyticsService.getCampaignTimeline(id, tenantId);
  }

  @Get("ab-test")
  async getABStats(
    @Param("id") id: string,
    @UserTenant() tenantId: string
  ) {
    return this.analyticsService.getABTestStats(id, tenantId);
  }

  @Get("heatmap")
  async getHeatmap(
    @Param("id") id: string,
    @UserTenant() tenantId: string,
    @Query("tags") tags?: string
  ) {
    const tagList = tags ? tags.split(",") : [];
    return this.analyticsService.getEngagementHeatmap(id, tenantId, tagList);
  }

  /**
   * Predictive Scheduling hint (Tenant-wide)
   */
  @Get("optimal-time")
  async getGlobalOptimalTime(
    @UserTenant() tenantId: string
  ) {
    return this.analyticsService.getOptimalSendTime(tenantId);
  }
}
