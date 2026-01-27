import { Repository } from 'typeorm';
import { AiAgent } from './entities/ai-agent.entity';
import { MessagesService } from '../messages/messages.service';
import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private messagesService;
    private configService;
    private aiAgentRepo;
    private genAI;
    private model;
    constructor(messagesService: MessagesService, configService: ConfigService, aiAgentRepo: Repository<AiAgent>);
    process(tenantId: string, from: string, messageBody: string): Promise<void>;
}
