import { Repository } from 'typeorm';
import { AiAgent } from './entities/ai-agent.entity';
export declare class AiController {
    private aiAgentRepo;
    constructor(aiAgentRepo: Repository<AiAgent>);
    getAgent(tenantId: string): Promise<AiAgent | {
        systemPrompt: string;
        active: boolean;
    }>;
    saveAgent(tenantId: string, body: {
        systemPrompt: string;
        active: boolean;
    }): Promise<AiAgent>;
    respond(tenantId: string, body: {
        conversationId: string;
        message: string;
    }): Promise<{
        status: string;
    }>;
}
