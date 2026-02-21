import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { TenantThrottlerGuard } from "@shared/guards/tenant-throttler.guard";
import { AuthorizationModule } from "@shared/authorization/authorization.module";
import { AuthorizationGuard } from "@shared/authorization/guards/authorization.guard";
import { TenantIsolationInterceptor } from "@shared/filters/tenant-isolation.interceptor";
import { TenantsModule } from "./tenants/tenants.module";
import { UsersModule } from "./users/users.module";
import { WhatsappModule } from "./whatsapp/whatsapp.module";
import { MessagesModule } from "./messages/messages.module";
import { WebhooksModule } from "./webhooks/webhooks.module";
import { AiModule } from "./ai/ai.module";
import { AutomationModule } from "./automation/automation.module";
import { CampaignsModule } from "./campaigns/campaigns.module";
import { TemplatesModule } from "./templates/templates.module";
import { MetaModule } from "./meta/meta.module";
import { SchedulerModule } from "./scheduler/scheduler.module";
import { ReferralsModule } from "./referrals/referrals.module";
import { ContactsModule } from "./contacts/contacts.module";
import { AuthModule } from "./auth/auth.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AdminModule } from "./admin/admin.module";
import { BillingModule } from "./billing/billing.module";
import { AuditModule } from "./audit/audit.module";
import { CommonModule } from "@shared/common.module";
import { ThrottlerModule } from "@nestjs/throttler";
import { AgentsModule } from "./agents/agents.module";
import { EmailModule } from "./email/email.module";
import { GoogleModule } from "./google/google.module";
import { ResellerModule } from "./reseller/reseller.module";
import { ApiKeysModule } from "./api-keys/api-keys.module";
import { TenantContextMiddleware } from "@shared/middleware/tenant-context.middleware";

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
        synchronize: configService.get("TYPEORM_SYNCHRONIZE") === "true",
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
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get("THROTTLE_TTL", 60),
          limit: configService.get("THROTTLE_LIMIT", 10),
        },
      ],
    }),
    CommonModule,
    AuthorizationModule,
    TenantsModule,
    UsersModule,
    WhatsappModule,
    MessagesModule,
    WebhooksModule,
    AiModule,
    AutomationModule,
    CampaignsModule,
    TemplatesModule,
    MetaModule,
    SchedulerModule,
    ReferralsModule,
    ContactsModule,
    AuthModule,
    AnalyticsModule,
    AdminModule,
    BillingModule,
    AuditModule,
    AgentsModule,
    EmailModule,
    GoogleModule,
    ResellerModule,
    ApiKeysModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: TenantThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantIsolationInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes("*");
  }
}
