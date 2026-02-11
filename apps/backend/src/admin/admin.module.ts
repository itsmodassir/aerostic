import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service'; // Keeping for backward compatibility if needed, or remove
import { Tenant } from '../tenants/entities/tenant.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { SystemConfig } from './entities/system-config.entity';
import { Message } from '../messages/entities/message.entity';
import { ApiKey } from '../billing/entities/api-key.entity';
import { Subscription } from '../billing/entities/subscription.entity';
import { AuditModule } from '../audit/audit.module';
import { WebhookEndpoint } from '../billing/entities/webhook-endpoint.entity';
import { User } from '../users/entities/user.entity';

import { Conversation } from '../messages/entities/conversation.entity';
import { Contact } from '../contacts/entities/contact.entity';

import { BillingModule } from '../billing/billing.module';

// New Services
import { AdminConfigService } from './services/admin-config.service';
import { AdminTenantService } from './services/admin-tenant.service';
import { AdminBillingService } from './services/admin-billing.service';
import { AdminHealthService } from './services/admin-health.service';
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminDatabaseService } from './services/admin-database.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      WhatsappAccount,
      SystemConfig,
      Message,
      ApiKey,
      Subscription,
      WebhookEndpoint,
      Conversation,
      Contact,
      User,
    ]),
    AuditModule,
    BillingModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService, // Deprecated, but keeping to avoid breaking other modules if they import it
    AdminConfigService,
    AdminTenantService,
    AdminBillingService,
    AdminHealthService,
    AdminAnalyticsService,
    AdminDatabaseService,
  ],
  exports: [
    AdminService,
    AdminConfigService,
    AdminTenantService,
    AdminBillingService,
    AdminHealthService,
    AdminAnalyticsService,
    AdminDatabaseService,
  ],
})
export class AdminModule { }
