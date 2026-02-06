import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Message } from '../messages/entities/message.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { AiAgent } from '../ai/entities/ai-agent.entity';
import { UsageMetric } from '../billing/entities/usage-metric.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Campaign,
      Contact,
      AiAgent,
      UsageMetric,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
