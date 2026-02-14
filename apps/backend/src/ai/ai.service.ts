import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAgent } from './entities/ai-agent.entity';
import { MessagesService } from '../messages/messages.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private messagesService: MessagesService,
    private configService: ConfigService,
    @InjectRepository(AiAgent)
    private aiAgentRepo: Repository<AiAgent>,
  ) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  async process(tenantId: string, from: string, messageBody: string, options?: { model?: string; systemPrompt?: string }) {
    if (!this.genAI) {
      // Fallback or error if AI is not configured
      return;
    }

    try {
      // Fetch Agent Configuration (Global Fallback)
      const agent = await this.aiAgentRepo.findOneBy({ tenantId });

      // Use Custom Prompt from Workflow OR Global Agent Prompt OR System Default
      const systemPrompt =
        options?.systemPrompt ||
        agent?.systemPrompt ||
        'You are a helpful and friendly customer support agent for Aerostic, a SaaS platform. Answer concisely.';

      const isActive = agent ? agent.isActive : true;

      if (!isActive && !options?.systemPrompt) {
        // Only block if using global agent and it's inactive.
        // If workflow explicitly invoked AI, we should probably run it.
        return;
      }

      // Model Selection (Mocking Switch for now, leveraging Gemini)
      // simplified for this iteration
      const modelName = options?.model?.includes('gpt') ? 'gemini-pro' : 'gemini-pro';
      const model = this.genAI.getGenerativeModel({ model: modelName });

      const prompt = `
System: ${systemPrompt}
Instruction: You are an AI agent. If you are not confident you can answer the user's question accurately, or if the user asks to speak to a human, reply exactly with "HANDOFF_TO_AGENT".
User: ${messageBody}
Agent:`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const aiReply = response.text();

      if (aiReply.includes('HANDOFF_TO_AGENT')) {
        return;
      }

      // Send the reply
      await this.messagesService.send({
        tenantId,
        to: from,
        type: 'text',
        payload: { text: aiReply },
      });
    } catch (e) {
      console.error('AI Generation Failed', e);
    }
  }
}
