import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { Conversation } from '../messages/entities/conversation.entity';
import { Message } from '../messages/entities/message.entity';
import { AutomationService } from '../automation/automation.service';
import { AiService } from '../ai/ai.service';
export declare class WebhooksService {
    private configService;
    private whatsappAccountRepo;
    private contactRepo;
    private conversationRepo;
    private messageRepo;
    private automationService;
    private aiService;
    constructor(configService: ConfigService, whatsappAccountRepo: Repository<WhatsappAccount>, contactRepo: Repository<Contact>, conversationRepo: Repository<Conversation>, messageRepo: Repository<Message>, automationService: AutomationService, aiService: AiService);
    verifyWebhook(mode: string, token: string, challenge: string): string;
    processWebhook(body: any): Promise<{
        status: string;
    } | undefined>;
}
