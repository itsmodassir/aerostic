import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAgent } from './entities/ai-agent.entity';

@Controller('ai')
export class AiController {
    constructor(
        @InjectRepository(AiAgent)
        private aiAgentRepo: Repository<AiAgent>,
    ) { }

    @Get('agent')
    async getAgent(@Query('tenantId') tenantId: string) {
        let agent = await this.aiAgentRepo.findOneBy({ tenantId });
        if (!agent) {
            // Return default structure if not found
            return {
                systemPrompt: "You are a helpful and friendly customer support agent for Aerostic, a SaaS platform. Answer concisely.",
                active: true
            };
        }
        return agent;
    }

    @Post('agent')
    async saveAgent(@Body() body: { tenantId: string; systemPrompt: string; active: boolean }) {
        let agent = await this.aiAgentRepo.findOneBy({ tenantId: body.tenantId });
        if (!agent) {
            agent = this.aiAgentRepo.create({ tenantId: body.tenantId });
        }

        agent.systemPrompt = body.systemPrompt;
        agent.active = body.active;

        return this.aiAgentRepo.save(agent);
    }
    @Post('respond')
    async respond(@Body() body: { tenantId: string; conversationId: string; message: string }) {
        // Internal Dispatcher Call
        // This ensures AI routes through proper channels
        console.log('AI Respond triggered internally', body);
        return { status: 'processed' };
    }
}
