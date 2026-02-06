import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { Conversation } from '../messages/entities/conversation.entity';
import { Message } from '../messages/entities/message.entity';
import { AutomationService } from '../automation/automation.service';
import { AiService } from '../ai/ai.service';
import { MessagesGateway } from '../messages/messages.gateway';
export declare class WebhooksService {
    private configService;
    private whatsappAccountRepo;
    private contactRepo;
    private conversationRepo;
    private messageRepo;
    private webhookQueue;
    private automationService;
    private aiService;
    private messagesGateway;
    private readonly logger;
    constructor(configService: ConfigService, whatsappAccountRepo: Repository<WhatsappAccount>, contactRepo: Repository<Contact>, conversationRepo: Repository<Conversation>, messageRepo: Repository<Message>, webhookQueue: Queue, automationService: AutomationService, aiService: AiService, messagesGateway: MessagesGateway);
    verifyWebhook(mode: string, token: string, challenge: string): string;
    processWebhook(body: any): Promise<{
        status: string;
    }>;
    handleProcessedPayload(body: any): Promise<{
        status: string;
    } | undefined>;
}
