import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WebhooksController } from "./webhooks.controller";
import { WhatsappAccount } from "../../shared/whatsapp/entities/whatsapp-account.entity";
import { Contact } from "@shared/database/entities/core/contact.entity";
import { Conversation } from "@shared/database/entities/messaging/conversation.entity";
import { Message } from "@shared/database/entities/messaging/message.entity";
import { Campaign } from "../campaigns/entities/campaign.entity";
import { AutomationModule } from "../automation/automation.module";
import { AiModule } from "../ai/ai.module";
import { MessagesModule } from "../messages/messages.module";

import { BillingModule } from "../billing/billing.module";
import { AdminModule } from "../admin/admin.module";
import { WhatsappModule } from "@shared/whatsapp/whatsapp.module";
import { WebhookSettingsController } from "./webhook-settings.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsappAccount, Contact, Conversation, Message, Campaign]),
    WhatsappModule,
    AutomationModule,
    AiModule,
    MessagesModule,
    BillingModule,
    AdminModule,
  ],
  controllers: [WebhooksController, WebhookSettingsController],
  providers: [],
})
export class WebhooksModule { }
