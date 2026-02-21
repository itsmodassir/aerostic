import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminService } from "./admin.service";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { WhatsappAccount } from "../../webhook-service/whatsapp/entities/whatsapp-account.entity";
import { SystemConfig } from "./entities/system-config.entity";
import { Message } from "@shared/database/entities/messaging/message.entity";
import { ApiKey } from "@shared/database/entities/core/api-key.entity";
import { Subscription } from "@shared/database/entities/billing/subscription.entity";
import { AuditModule } from "../audit/audit.module";
import { WebhookEndpoint } from "../billing/entities/webhook-endpoint.entity";
import { User } from "@shared/database/entities/core/user.entity";
import { EmailMessage } from "./entities/email-message.entity";
import { TenantMembership } from "@shared/database/entities/core/tenant-membership.entity";
import { ResellerConfig } from "@shared/database/entities/core/reseller-config.entity";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { SystemDailyMetric } from "@shared/database/entities/analytics/system-daily-metric.entity";
import { TenantDailyMetric } from "@shared/database/entities/analytics/tenant-daily-metric.entity";

import { Conversation } from "@shared/database/entities/messaging/conversation.entity";
import { Mailbox } from "@shared/database/entities/core/mailbox.entity";

import { BillingModule } from "../billing/billing.module";

// New Services
import { AdminConfigService } from "./services/admin-config.service";
import { AdminTenantService } from "./services/admin-tenant.service";
import { AdminBillingService } from "./services/admin-billing.service";
import { AdminHealthService } from "./services/admin-health.service";
import { AdminAnalyticsService } from "./services/admin-analytics.service";
import { AdminDatabaseService } from "./services/admin-database.service";
import { AdminInboxService } from "./services/admin-inbox.service";
import { AdminRiskService } from "./services/admin-risk.service";
import { RiskGateway } from "./gateways/risk.gateway";

// New Controllers
import { PlatformAdminController } from "./controllers/platform-admin.controller";
import { SuperAdminController } from "./controllers/super-admin.controller";
import { AdminTenantController } from "./controllers/admin-tenant.controller";
import { AdminBillingController } from "./controllers/admin-billing.controller";
import { AdminSupportController } from "./controllers/admin-support.controller";
import { AdminRiskController } from "./controllers/admin-risk.controller";

// Risk Entities
import { PlatformRiskSnapshot } from "@shared/database/entities/analytics/platform-risk-snapshot.entity";
import { TenantRiskScore } from "@shared/database/entities/analytics/tenant-risk-score.entity";
import { ApiKeyRiskEvent } from "../billing/entities/api-key-risk-event.entity";
import { PlatformAnomalyCluster } from "@shared/database/entities/analytics/platform-anomaly-cluster.entity";

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
      User,
      EmailMessage,
      Mailbox,
      TenantMembership,
      ResellerConfig,
      PlatformRiskSnapshot,
      TenantRiskScore,
      ApiKeyRiskEvent,
      PlatformAnomalyCluster,
      SystemDailyMetric,
      TenantDailyMetric,
    ]),
    AuditModule,
    BillingModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [
    PlatformAdminController,
    SuperAdminController,
    AdminTenantController,
    AdminBillingController,
    AdminSupportController,
    AdminRiskController,
  ],
  providers: [
    AdminService,
    AdminConfigService,
    AdminTenantService,
    AdminBillingService,
    AdminHealthService,
    AdminAnalyticsService,
    AdminDatabaseService,
    AdminInboxService,
    AdminRiskService,
    RiskGateway,
  ],
  exports: [
    AdminService,
    AdminConfigService,
    AdminTenantService,
    AdminBillingService,
    AdminHealthService,
    AdminAnalyticsService,
    AdminDatabaseService,
    AdminInboxService,
    AdminRiskService,
    RiskGateway,
  ],
})
export class AdminModule {}
