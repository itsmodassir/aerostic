import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WebhooksController } from "./webhooks.controller";
import { WhatsappAccount } from "../../shared/whatsapp/entities/whatsapp-account.entity";
import { Contact } from "@shared/database/entities/core/contact.entity";
import { Conversation } from "@shared/database/entities/messaging/conversation.entity";
import { Message } from "@shared/database/entities/messaging/message.entity";
import { AutomationModule } from "@api/automation/automation.module";
import { AiModule } from "@api/ai/ai.module";
import { MessagesModule } from "@api/messages/messages.module";

import { BillingModule } from "@api/billing/billing.module";
import { WhatsappModule } from "@shared/whatsapp/whatsapp.module";
import { WebhookSettingsController } from "./webhook-settings.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsappAccount, Contact, Conversation, Message]),
    WhatsappModule,
    AutomationModule,
    AiModule,
    MessagesModule,
    BillingModule,
  ],
  controllers: [WebhooksController, WebhookSettingsController],
  providers: [],
})
export class WebhooksModule { }
