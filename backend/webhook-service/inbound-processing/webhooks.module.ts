import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WebhooksService } from "./webhooks.service";
import { WebhooksController } from "./webhooks.controller";
import { WhatsappAccount } from "../whatsapp/entities/whatsapp-account.entity";
import { Contact } from "@shared/database/entities/core/contact.entity";
import { Conversation } from "@shared/database/entities/messaging/conversation.entity";
import { Message } from "@shared/database/entities/messaging/message.entity";
import { AutomationModule } from "@api/automation/automation.module";
import { AiModule } from "@api/ai/ai.module";
import { BullModule } from "@nestjs/bullmq";
import { MessagesModule } from "@api/messages/messages.module";

import { BillingModule } from "@api/billing/billing.module";
import { WebhookSettingsController } from "./webhook-settings.controller";
import { WebhooksProcessor } from "./webhooks.processor";

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsappAccount, Contact, Conversation, Message]),
    BullModule.registerQueue({
      name: "whatsapp-webhooks",
    }),
    AutomationModule,
    AiModule,
    MessagesModule,
    BillingModule,
  ],
  controllers: [WebhooksController, WebhookSettingsController],
  providers: [WebhooksService, WebhooksProcessor],
})
export class WebhooksModule { }
