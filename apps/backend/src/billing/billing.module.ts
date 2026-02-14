import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageMetric } from './entities/usage-metric.entity';
import { Subscription } from './entities/subscription.entity';
import { ApiKey } from './entities/api-key.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { RazorpayEvent } from './entities/razorpay-event.entity';
import { RazorpayService } from './razorpay.service';
import { BillingService } from './billing.service';
import { PlansService } from './plans.service';
import { BillingController } from './billing.controller';
import { BillingWebhookController } from './controllers/billing-webhook.controller';
import { BillingSubscriptionController } from './controllers/billing-subscription.controller';
import { BillingApiKeysController } from './controllers/billing-api-keys.controller';
import { AdminApiKeysController } from './controllers/admin-api-keys.controller';
import { PlansController } from './controllers/plans.controller';
import { RazorpayWebhookGuard } from './guards/razorpay-webhook.guard';
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { Plan } from './entities/plan.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Invoice } from './entities/invoice.entity';

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
    ]),
    AuditModule,
    UsersModule,
  ],
  controllers: [
    BillingController,
    BillingWebhookController,
    BillingSubscriptionController,
    BillingApiKeysController,
    AdminApiKeysController,
    PlansController,
  ],
  providers: [RazorpayService, BillingService, RazorpayWebhookGuard, PlansService],
  exports: [RazorpayService, BillingService, PlansService],
})
export class BillingModule { }
