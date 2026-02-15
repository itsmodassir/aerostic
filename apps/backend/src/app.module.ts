import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';
import { TenantThrottlerGuard } from './common/guards/tenant-throttler.guard';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { MessagesModule } from './messages/messages.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AiModule } from './ai/ai.module';
import { AutomationModule } from './automation/automation.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { TemplatesModule } from './templates/templates.module';
import { MetaModule } from './meta/meta.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ReferralsModule } from './referrals/referrals.module';
import { ContactsModule } from './contacts/contacts.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { BillingModule } from './billing/billing.module';
import { AuditModule } from './audit/audit.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from './common/common.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AgentsModule } from './agents/agents.module';
import { EmailModule } from './email/email.module';
import { GoogleModule } from './google/google.module';
import { ResellerModule } from './reseller/reseller.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false, // Always false in prod
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('THROTTLE_TTL', 60),
          limit: configService.get('THROTTLE_LIMIT', 10),
        },
      ],
    }),
    ScheduleModule.forRoot(),
    CommonModule,
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: TenantThrottlerGuard,
    },
  ],
})
export class AppModule { }
