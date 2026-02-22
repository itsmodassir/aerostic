import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsageEvent } from "@shared/database/entities/billing/usage-event.entity";
import { WalletTransaction } from "@shared/database/entities/billing/wallet-transaction.entity";
import { UsageMetric } from "./entities/usage-metric.entity";
import { Subscription } from "@shared/database/entities/billing/subscription.entity";
import { Wallet } from "@shared/database/entities/billing/wallet.entity";
import { WalletAccount } from "@shared/database/entities/billing/wallet-account.entity";
import { ApiKey } from "@shared/database/entities/core/api-key.entity";
import { ApiKeyRiskEvent } from "./entities/api-key-risk-event.entity";
import { WebhookEndpoint } from "./entities/webhook-endpoint.entity";
import { RazorpayEvent } from "./entities/razorpay-event.entity";
import { TenantsModule } from "../tenants/tenants.module";
import { RazorpayService } from "./razorpay.service";
import { BillingService } from "./billing.service";
import { WalletService } from "./wallet.service";
import { PlansService } from "./plans.service";
import { BillingController } from "./billing.controller";
import { BillingWebhookController } from "./controllers/billing-webhook.controller";
import { BillingSubscriptionController } from "./controllers/billing-subscription.controller";
import { BillingApiKeysController } from "./controllers/billing-api-keys.controller";
import { AdminApiKeysController } from "./controllers/admin-api-keys.controller";
import { PlansController } from "./controllers/plans.controller";
import { WalletController } from "./controllers/wallet.controller";
import { RazorpayWebhookGuard } from "./guards/razorpay-webhook.guard";
import { AuditModule } from "../audit/audit.module";
import { UsersModule } from "../users/users.module";
import { User } from "@shared/database/entities/core/user.entity";
import { Plan } from "@shared/database/entities/billing/plan.entity";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { Invoice } from "./entities/invoice.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsageMetric,
      Subscription,
      Plan,
      ApiKey,
      WebhookEndpoint,
      RazorpayEvent,
      User,
      Tenant,
      Invoice,
      UsageEvent,
      Wallet,
      WalletAccount,
      WalletTransaction,
      ApiKeyRiskEvent,
    ]),
    AuditModule,
    UsersModule,
    TenantsModule,
  ],
  controllers: [
    BillingController,
    BillingWebhookController,
    BillingSubscriptionController,
    BillingApiKeysController,
    AdminApiKeysController,
    PlansController,
    WalletController,
  ],
  providers: [
    RazorpayService,
    BillingService,
    WalletService,
    RazorpayWebhookGuard,
    PlansService,
  ],
  exports: [RazorpayService, BillingService, WalletService, PlansService],
})
export class BillingModule { }
