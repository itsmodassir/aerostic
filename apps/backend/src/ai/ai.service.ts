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

  async process(tenantId: string, from: string, messageBody: string) {
    if (!this.model) {
      return;
    }

    try {
      // Fetch Agent Configuration
      const agent = await this.aiAgentRepo.findOneBy({ tenantId });

      // Default System Prompt if not configured
      const systemPrompt =
        agent?.systemPrompt ||
        'You are a helpful and friendly customer support agent for Aerostic, a SaaS platform. Answer concisely.';
      const isActive = agent ? agent.isActive : true; // Default active

      if (!isActive) {
        return;
      }

      const prompt = `
System: ${systemPrompt}
Instruction: You are an AI agent. If you are not confident you can answer the user's question accurately, or if the user asks to speak to a human, reply exactly with "HANDOFF_TO_AGENT".
User: ${messageBody}
Agent:`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const aiReply = response.text();

      if (aiReply.includes('HANDOFF_TO_AGENT')) {
        // TODO: Update Conversation Status to 'needs_human' or notify agents
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
