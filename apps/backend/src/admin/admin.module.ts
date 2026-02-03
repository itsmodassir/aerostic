import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { SystemConfig } from './entities/system-config.entity';
import { Message } from '../messages/entities/message.entity';
import { ApiKey } from '../billing/entities/api-key.entity';
import { Subscription } from '../billing/entities/subscription.entity';
import { AuditModule } from '../audit/audit.module';
import { WebhookEndpoint } from '../billing/entities/webhook-endpoint.entity';

import { Conversation } from '../messages/entities/conversation.entity';
import { Contact } from '../contacts/entities/contact.entity';

import { BillingModule } from '../billing/billing.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Tenant, WhatsappAccount, SystemConfig, Message, ApiKey, Subscription, WebhookEndpoint, Conversation, Contact]),
        AuditModule,
        BillingModule
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }
