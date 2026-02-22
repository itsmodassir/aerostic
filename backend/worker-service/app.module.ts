import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { AnomalyWorkerModule } from "./anomaly-worker/anomaly.module";
import { METRICS_QUEUE } from "../shared/queue/queue-names";

// Assuming entities are shared
import { AuditLog } from "../shared/database/entities/core/audit-log.entity";
import { AnomalyEvent } from "../shared/database/entities/analytics/anomaly-event.entity";
import { TenantRiskScore } from "../shared/database/entities/analytics/tenant-risk-score.entity";
import { TenantBehaviorProfile } from "../shared/database/entities/analytics/behavior-profile.entity";

import { CommonModule } from "@shared/common.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        url: config.get<string>("DATABASE_URL"),
        autoLoadEntities: true,
        synchronize: false, // Security: never sync in prod
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>("REDIS_HOST"),
          port: config.get<number>("REDIS_PORT"),
        },
      }),
    }),
    // Register Queues for BaseWorker or others
    BullModule.registerQueue({
      name: METRICS_QUEUE,
    }),

    // Feature Modules
    AnomalyWorkerModule,
  ],
})
export class AppModule { }
