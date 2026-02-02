import { Repository } from 'typeorm';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { Message } from './entities/message.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { Conversation } from './entities/conversation.entity';
import { MetaToken } from '../meta/entities/meta-token.entity';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagesService {
    private whatsappAccountRepo;
    private messageRepo;
    private metaTokenRepo;
    private contactRepo;
    private conversationRepo;
    constructor(whatsappAccountRepo: Repository<WhatsappAccount>, messageRepo: Repository<Message>, metaTokenRepo: Repository<MetaToken>, contactRepo: Repository<Contact>, conversationRepo: Repository<Conversation>);
    send(dto: SendMessageDto): Promise<{
        sent: boolean;
        metaId: any;
        messageId: string;
    }>;
    getConversations(tenantId: string): Promise<Conversation[]>;
    getMessages(tenantId: string, conversationId: string): Promise<Message[]>;
    cleanupMockData(): Promise<{
        deleted: number;
    }>;
}
