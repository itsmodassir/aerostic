import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { Conversation } from '../messages/entities/conversation.entity';
import { Message } from '../messages/entities/message.entity';
import { AutomationModule } from '../automation/automation.module';
import { AiModule } from '../ai/ai.module';
import { BullModule } from '@nestjs/bullmq';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsappAccount, Contact, Conversation, Message]),
    BullModule.registerQueue({
      name: 'whatsapp-webhooks',
    }),
    AutomationModule,
    AiModule,
    MessagesModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule { }
