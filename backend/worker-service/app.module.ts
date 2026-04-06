import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { WhatsappWorkerModule } from "./whatsapp-worker/whatsapp-worker.module";
import { METRICS_QUEUE } from "../shared/queue/queue-names";

// Assuming entities are shared
import { AuditLog } from "../shared/database/entities/core/audit-log.entity";
import { CommonModule } from "@shared/common.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../.env", "../../.env", "/var/www/aimstors/backend/.env"],
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
    WhatsappWorkerModule,
  ],
})
export class AppModule { }
