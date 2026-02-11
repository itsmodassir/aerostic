import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageMetric } from './entities/usage-metric.entity';
import { Subscription } from './entities/subscription.entity';
import { ApiKey } from './entities/api-key.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { RazorpayEvent } from './entities/razorpay-event.entity';
import { RazorpayService } from './razorpay.service';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { BillingWebhookController } from './controllers/billing-webhook.controller';
import { BillingSubscriptionController } from './controllers/billing-subscription.controller';
import { BillingApiKeysController } from './controllers/billing-api-keys.controller';
import { RazorpayWebhookGuard } from './guards/razorpay-webhook.guard';
// Guards are usually not required to be providers if using standard @UseGuards
// Guards are usually not required to be providers if using standard @UseGuards
// But we might need ConfigService imports if not global
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsageMetric,
      Subscription,
      ApiKey,
      WebhookEndpoint,
      RazorpayEvent,
      User,
    ]),
    AuditModule,
    UsersModule,
  ],
  controllers: [
    BillingController, // Deprecated? Keeping for now or removing if fully migrated.
    // The plan suggests replacing functionality. Let's keep it but ideally migrated.
    // Actually, user asked to split it. We should assume we can remove/deprecate.
    // For safety, I'll keep it but new controllers are primary.
    BillingWebhookController,
    BillingSubscriptionController,
    BillingApiKeysController,
  ],
  providers: [RazorpayService, BillingService, RazorpayWebhookGuard],
  exports: [RazorpayService, BillingService],
})
export class BillingModule {}
