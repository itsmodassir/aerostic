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

  async runAgent(tenantId: string, messageBody: string, tools: any[], systemPrompt: string): Promise<string> {
    if (!this.genAI) return 'AI not configured';

    // 1. Prepare Tools
    const toolMap = new Map(tools.map(t => [t.name, t]));
    const functionDeclarations = tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }));

    // 2. Initialize Model
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-pro',
      tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined
    });

    // 3. Start Chat Session
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: `System: ${systemPrompt}` }] },
        { role: 'model', parts: [{ text: 'Understood. I am ready to help.' }] }
      ]
    });

    try {
      // 4. Send Initial Message
      let result = await chat.sendMessage(messageBody);
      let response = result.response;

      // 5. Execution Loop (Max 10 turns to prevent infinite loops)
      let turns = 0;
      const MAX_TURNS = 10;

      while (turns < MAX_TURNS) {
        const functionCalls = response.functionCalls();

        // If no function calls, we are done
        if (!functionCalls || functionCalls.length === 0) {
          return response.text();
        }

        // Execute all requested tools
        const toolResults = [];
        for (const call of functionCalls) {
          const tool = toolMap.get(call.name);
          if (tool) {
            try {
              console.log(`[Agent] Calling Tool: ${call.name}`);
              const output = await tool.execute(call.args);

              // Ensure output is a string or object that Gemini can handle
              const content = typeof output === 'string' ? output : JSON.stringify(output);

              toolResults.push({
                functionResponse: {
                  name: call.name,
                  response: { name: call.name, content: content }
                }
              });
            } catch (err) {
              console.error(`[Agent] Tool Error (${call.name}):`, err);
              toolResults.push({
                functionResponse: {
                  name: call.name,
                  response: { name: call.name, content: `Error: ${err.message}` }
                }
              });
            }
          } else {
            toolResults.push({
              functionResponse: {
                name: call.name,
                response: { name: call.name, content: `Error: Tool ${call.name} not found` }
              }
            });
          }
        }

        // Send tool results back to the model
        if (toolResults.length > 0) {
          result = await chat.sendMessage(toolResults);
          response = result.response;
        } else {
          // Should not happen if functionCalls > 0 but safety break
          break;
        }

        turns++;
      }

      return response.text();

    } catch (e) {
      console.error('Agent Execution Failed:', e);
      return `Agent Error: ${e.message}`;
    }
  }
}
