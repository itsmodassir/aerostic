import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessagesService } from "./messages.service";
import { MessagesController } from "./messages.controller";
import { Message } from "@shared/database/entities/messaging/message.entity";
import { Conversation } from "@shared/database/entities/messaging/conversation.entity";
import { Contact } from "@shared/database/entities/core/contact.entity";
import { WhatsappAccount } from "../whatsapp/entities/whatsapp-account.entity";
import { MetaToken } from "../meta/entities/meta-token.entity";
import { User } from "@shared/database/entities/core/user.entity";
import { Template } from "../templates/entities/template.entity";
import { MessagesGateway } from "./messages.gateway";
import { AuditModule } from "../audit/audit.module";
import { BillingModule } from "../billing/billing.module";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Conversation,
      WhatsappAccount,
      MetaToken,
      Contact,
      User,
      Template,
    ]),
    AuditModule,
    BillingModule,
    AdminModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesService, MessagesGateway],
})
export class MessagesModule { }
