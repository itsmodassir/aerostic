import { Repository } from 'typeorm';
import { AiAgent } from './entities/ai-agent.entity';
export declare class AiController {
    private aiAgentRepo;
    constructor(aiAgentRepo: Repository<AiAgent>);
    getAgent(tenantId: string): Promise<AiAgent | {
        systemPrompt: string;
        active: boolean;
    }>;
    saveAgent(body: {
        tenantId: string;
        systemPrompt: string;
        active: boolean;
    }): Promise<AiAgent>;
    respond(body: {
        tenantId: string;
        conversationId: string;
        message: string;
    }): Promise<{
        status: string;
    }>;
}
