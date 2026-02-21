import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { CommonModule } from "@shared/common.module";
import { WebhooksModule } from "./inbound-processing/webhooks.module";
import { MetaModule } from "./inbound-processing/meta.module";
import { WhatsappModule } from "./whatsapp/whatsapp.module";
import { AuditModule } from "@api/audit/audit.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get("DATABASE_URL"),
        autoLoadEntities: true,
        synchronize: false,
        logging: configService.get("NODE_ENV") === "development",
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get("REDIS_HOST", "localhost"),
          port: config.get("REDIS_PORT", 6379),
        },
      }),
    }),
    CommonModule,
    AuditModule,
    WebhooksModule,
    MetaModule,
    WhatsappModule,
  ],
})
export class AppModule {}
