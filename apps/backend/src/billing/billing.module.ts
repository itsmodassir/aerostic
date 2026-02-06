import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageMetric } from './entities/usage-metric.entity';
import { Subscription } from './entities/subscription.entity';
import { ApiKey } from './entities/api-key.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { RazorpayService } from './razorpay.service';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsageMetric,
      Subscription,
      ApiKey,
      WebhookEndpoint,
    ]),
  ],
  controllers: [BillingController],
  providers: [RazorpayService, BillingService],
  exports: [RazorpayService, BillingService],
})
export class BillingModule {}
