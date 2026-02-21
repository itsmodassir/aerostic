import { Module, Global } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  CAMPAIGN_QUEUE,
  AUTOMATION_QUEUE,
  AI_QUEUE,
  WEBHOOK_QUEUE,
  USAGE_AGGREGATION_QUEUE,
  METRICS_QUEUE,
} from "./queue-names";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get("REDIS_HOST", "localhost"),
          port: configService.get("REDIS_PORT", 6379),
          password: configService.get("REDIS_PASSWORD"),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: CAMPAIGN_QUEUE },
      { name: AUTOMATION_QUEUE },
      { name: AI_QUEUE },
      { name: WEBHOOK_QUEUE },
      { name: USAGE_AGGREGATION_QUEUE },
      { name: METRICS_QUEUE },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
