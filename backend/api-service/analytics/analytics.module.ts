import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsController } from "./analytics.controller";
import { SystemDailyMetric } from "@shared/database/entities/analytics/system-daily-metric.entity";
import { TenantDailyMetric } from "@shared/database/entities/analytics/tenant-daily-metric.entity";
import { ApiKeyUsage } from "@shared/database/entities/analytics/api-key-usage.entity";
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
      Message,
      Campaign,
      Contact,
      AiAgent,
      UsageMetric,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
