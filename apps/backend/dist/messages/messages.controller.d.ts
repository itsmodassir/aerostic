import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    sendMessage(dto: SendMessageDto): Promise<{
        sent: boolean;
        metaId: any;
        messageId: string;
    }>;
    getConversations(tenantId: string): Promise<import("./entities/conversation.entity").Conversation[]>;
    getConversationMessages(tenantId: string, conversationId: string): Promise<import("./entities/message.entity").Message[]>;
}
