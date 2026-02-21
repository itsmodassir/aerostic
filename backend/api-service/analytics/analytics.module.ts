import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsController } from "./analytics.controller";
import { SystemDailyMetric } from "@shared/database/entities/analytics/system-daily-metric.entity";
import { TenantDailyMetric } from "@shared/database/entities/analytics/tenant-daily-metric.entity";
import { ApiKeyUsage } from "@shared/database/entities/analytics/api-key-usage.entity";
import { TenantBehaviorProfile } from "@shared/database/entities/analytics/behavior-profile.entity";
import { TenantRiskScore } from "@shared/database/entities/analytics/tenant-risk-score.entity";
import { AnomalyEvent } from "@shared/database/entities/analytics/anomaly-event.entity";
import { PlatformAnomalyCluster } from "@shared/database/entities/analytics/platform-anomaly-cluster.entity";
import { TenantHourlyMetric } from "@shared/database/entities/analytics/tenant-hourly-metric.entity";
import { AnomalyService } from "./anomaly.service";
import { ProfilingService } from "./profiling.service";

import { AnomalyController } from "./anomaly.controller";
import { Message } from "@shared/database/entities/messaging/message.entity";
import { Campaign } from "../campaigns/entities/campaign.entity";
import { Contact } from "@shared/database/entities/core/contact.entity";
import { AiAgent } from "../ai/entities/ai-agent.entity";
import { UsageMetric } from "../billing/entities/usage-metric.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemDailyMetric,
      TenantDailyMetric,
      ApiKeyUsage,
      TenantBehaviorProfile,
      TenantRiskScore,
      AnomalyEvent,
      PlatformAnomalyCluster,
      TenantHourlyMetric,
      Message,
      Campaign,
      Contact,
      AiAgent,
      UsageMetric,
    ]),
  ],
  controllers: [AnalyticsController, AnomalyController],
  providers: [AnalyticsService, AnomalyService, ProfilingService],
  exports: [AnalyticsService, AnomalyService],
})
export class AnalyticsModule {}
