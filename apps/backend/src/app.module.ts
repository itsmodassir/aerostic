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
import { ContactsModule } from './contacts/contacts.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { BillingModule } from './billing/billing.module';
import { AuditModule } from './audit/audit.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from './common/common.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    CommonModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false, // 🔒 Disabled for production safety
        logging:
          configService.get('NODE_ENV') === 'development'
            ? ['error', 'warn', 'query']
            : ['error'], // Only log errors in production
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST') || 'localhost',
          port: Number(config.get('REDIS_PORT')) || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    TenantsModule,
    UsersModule,
    WhatsappModule,
    MessagesModule,
    WebhooksModule,
    AiModule,
    AutomationModule,
    CampaignsModule,
    TemplatesModule,
    AdminModule,
    BillingModule,
    MetaModule,
    ContactsModule,
    AuthModule,
    AnalyticsModule,
    AuditModule,
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
export class AppModule {}
