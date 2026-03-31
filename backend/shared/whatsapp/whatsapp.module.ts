import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { WhatsappAccount } from "./entities/whatsapp-account.entity";
import { Contact } from "../database/entities/core/contact.entity";
import { Conversation } from "../database/entities/messaging/conversation.entity";
import { Message } from "../database/entities/messaging/message.entity";
import { WhatsappService } from "./whatsapp.service";
import { WebhooksService } from "./webhooks.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WhatsappAccount,
      Contact,
      Conversation,
      Message,
    ]),
    BullModule.registerQueue({
      name: "whatsapp-messages",
    }),
    BullModule.registerQueue({
      name: "whatsapp-webhooks",
    }),
  ],
  providers: [WhatsappService, WebhooksService],
  exports: [WhatsappService, WebhooksService],
})
export class WhatsappModule {}
