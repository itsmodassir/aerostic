import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { WhatsappAccount } from "./entities/whatsapp-account.entity";
import { Contact } from "../database/entities/core/contact.entity";
import { Conversation } from "../database/entities/messaging/conversation.entity";
import { Message } from "../database/entities/messaging/message.entity";
import { Campaign } from "../../api-service/campaigns/entities/campaign.entity";
import { CatalogProduct } from "../database/entities/commerce/catalog-product.entity";
import { Order } from "../database/entities/commerce/order.entity";
import { OrderItem } from "../database/entities/commerce/order-item.entity";
import { WhatsappService } from "./whatsapp.service";
import { WebhooksService } from "./webhooks.service";
import { AiModule } from "../../api-service/ai/ai.module";
import { MessagesModule } from "../../api-service/messages/messages.module";
import {
  AutomationFlow,
  AutomationNode,
  AutomationEdge,
  AutomationExecution,
  AutomationExecutionLog,
} from "../database/entities/core/automation-flow.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WhatsappAccount,
      Contact,
      Conversation,
      Message,
      Campaign,
      AutomationFlow,
      AutomationNode,
      AutomationEdge,
      AutomationExecution,
      AutomationExecutionLog,
      CatalogProduct,
      Order,
      OrderItem,
    ]),
    forwardRef(() => AiModule),
    forwardRef(() => MessagesModule),
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
