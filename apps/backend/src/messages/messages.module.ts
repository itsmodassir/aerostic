import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { MetaToken } from '../meta/entities/meta-token.entity';

import { Conversation } from './entities/conversation.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { User } from '../users/entities/user.entity';
import { MessagesGateway } from './messages.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Conversation,
      WhatsappAccount,
      MetaToken,
      Contact,
      User,
    ]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesService],
})
export class MessagesModule {}
