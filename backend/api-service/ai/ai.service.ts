import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { AiAgent } from "./entities/ai-agent.entity";
import { MessagesService } from "../messages/messages.service";
import { KnowledgeChunk } from "./entities/knowledge-chunk.entity";
import { KnowledgeBase } from "./entities/knowledge-base.entity";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { AdminConfigService } from "../admin/services/admin-config.service";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private messagesService: MessagesService,
    private configService: ConfigService,
    private adminConfigService: AdminConfigService,
    @InjectRepository(AiAgent)
    private aiAgentRepo: Repository<AiAgent>,
    @InjectRepository(KnowledgeChunk)
    private chunkRepo: Repository<KnowledgeChunk>,
    @InjectRepository(KnowledgeBase)
    private kbRepo: Repository<KnowledgeBase>,
  ) {}

  /**
   * Returns a Gemini client initialized with the current admin config key.
   * Falls back to env var for backward compatibility.
   */
  private async getGeminiClient(): Promise<GoogleGenerativeAI | null> {
    const key = await this.adminConfigService.getConfigValue("ai.gemini_api_key");
    if (!key) return null;
    return new GoogleGenerativeAI(key);
  }

  /**
   * Returns an OpenAI client initialized with the current admin config key.
   * Falls back to env var for backward compatibility.
   */
  private async getOpenAIClient(): Promise<OpenAI | null> {
    const key = await this.adminConfigService.getConfigValue("ai.openai_api_key");
    if (!key) return null;
    return new OpenAI({ apiKey: key });
  }

  async process(
    tenantId: string,
    from: string,
    messageBody: string,
    options?: { model?: string; systemPrompt?: string },
  ) {
    const genAI = await this.getGeminiClient();
    const openai = await this.getOpenAIClient();

    if (!openai && !genAI) {
      this.logger.warn("No AI provider configured. Set ai.gemini_api_key or ai.openai_api_key in admin config.");
      return;
    }

    try {
      const agent = await this.aiAgentRepo.findOneBy({ tenantId });

      const systemPrompt =
        options?.systemPrompt ||
        agent?.systemPrompt ||
        "You are a helpful and friendly customer support agent. Answer concisely.";

      const isActive = agent ? agent.isActive : true;
      if (!isActive && !options?.systemPrompt) return;

      const modelName = options?.model || (genAI ? "gemini-flash-lite-latest" : "gpt-4o");
      const isGemini = modelName.toLowerCase().includes("gemini");

      let contextStr = "";

      // 1. Intent Detection
      if (agent?.intentDetection) {
        const intentPrompt = `Analyze the intent of this user message: "${messageBody}". Reply ONLY with: FAQ, HUMAN_SUPPORT, SALES, or OTHER.`;
        let intent = "FAQ";

        if (isGemini && genAI) {
          const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
          const result = await model.generateContent(intentPrompt);
          intent = result.response.text().trim();
        } else if (openai) {
          const r = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: intentPrompt }],
            temperature: 0,
          });
          intent = r.choices[0]?.message?.content?.trim() || "FAQ";
        }

        if (intent.includes("HUMAN_SUPPORT")) {
          this.messagesService.send({
            tenantId,
            to: from,
            type: "text",
            payload: { text: "Let me hand you over to a human agent right away." },
          });
          return;
        }
        contextStr += `[Detected User Intent: ${intent}]\n`;
      }

      // 2. Personalization
      if (agent?.personalizationEnabled) {
        contextStr += `[Personalization: warm, adaptive tone.]\n`;
      }

      // 3. Knowledge Base / RAG
      const kbs = await this.kbRepo.find({ where: { tenantId } });
      let kbContext = "";
      for (const kb of kbs) {
        const chunks = await this.findRelevantChunks(kb.id, messageBody, 3);
        if (chunks.length > 0) kbContext += chunks.join("\n---\n") + "\n";
      }
      if (kbContext) contextStr += `\n[Reference Knowledge Base]:\n${kbContext}\n`;

      let aiReply = "";

      if (isGemini && genAI) {
        const tools: any[] = [];
        if (agent?.webSearchEnabled) {
          tools.push({
            googleSearchRetrieval: {
              dynamicRetrievalConfig: {
                mode: "DYNAMIC",
                dynamicThreshold: 0.3,
              },
            },
          });
        }

        const model = genAI.getGenerativeModel({ model: modelName, tools: tools.length > 0 ? tools : undefined });
        const prompt = `${systemPrompt}\n\nContext:\n${contextStr}\n\nNote: If uncertain, reply exactly "HANDOFF_TO_AGENT".\n\nUser: ${messageBody}`;
        const result = await model.generateContent(prompt);
        aiReply = result.response.text();
      } else if (openai) {
        const completion = await openai.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "system", content: contextStr },
            { role: "system", content: `Answer the User. If uncertain, reply exactly "HANDOFF_TO_AGENT".` },
            { role: "user", content: messageBody },
          ],
        });
        aiReply = completion.choices[0]?.message?.content || "";
      }

      if (aiReply.includes("HANDOFF_TO_AGENT")) return;

      await this.messagesService.send({
        tenantId,
        to: from,
        type: "text",
        payload: { text: aiReply },
      });
    } catch (e) {
      this.logger.error("AI Generation Failed", e);
    }
  }

  async runAgent(
    tenantId: string,
    messageBody: string,
    tools: any[],
    systemPrompt: string,
  ): Promise<string> {
    const genAI = await this.getGeminiClient();
    const openai = await this.getOpenAIClient();

    if (!openai && !genAI) return "AI not configured";

    const toolMap = new Map(tools.map((t) => [t.name, t]));
    const formattedTools = tools.map((t) => ({
      type: "function" as const,
      function: { name: t.name, description: t.description, parameters: t.parameters },
    }));

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: messageBody },
    ];

    try {
      if (openai) {
        let turns = 0;
        const MAX_TURNS = 10;

        while (turns < MAX_TURNS) {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages,
            tools: formattedTools.length > 0 ? formattedTools : undefined,
          });

          const responseMessage = completion.choices[0]?.message;
          if (!responseMessage) break;
          messages.push(responseMessage);

          const toolCalls = responseMessage.tool_calls;
          if (!toolCalls || toolCalls.length === 0) return responseMessage.content || "";

          for (const call of toolCalls) {
            if (call.type !== "function") continue;
            const tool = toolMap.get(call.function.name);
            let functionArgs: any = {};
            try { functionArgs = JSON.parse(call.function.arguments); } catch {}
            if (tool) {
              try {
                const output = await tool.execute(functionArgs);
                messages.push({ tool_call_id: call.id, role: "tool", name: call.function.name, content: typeof output === "string" ? output : JSON.stringify(output) });
              } catch (err: any) {
                messages.push({ tool_call_id: call.id, role: "tool", name: call.function.name, content: `Error: ${err.message}` });
              }
            } else {
              messages.push({ tool_call_id: call.id, role: "tool", name: call.function.name, content: `Tool not found` });
            }
          }
          turns++;
        }
      } else if (genAI) {
        const agent = await this.aiAgentRepo.findOneBy({ tenantId });
        const tools: any[] = [];
        if (agent?.webSearchEnabled) {
          tools.push({
            googleSearchRetrieval: {
              dynamicRetrievalConfig: {
                mode: "DYNAMIC",
                dynamicThreshold: 0.3,
              },
            },
          });
        }

        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          tools: tools.length > 0 ? tools : undefined,
        });

        const result = await model.generateContent(`${systemPrompt}\n\nUser: ${messageBody}`);
        return result.response.text();
      }

      return messages[messages.length - 1]?.content || "Agent execution finished.";
    } catch (e: any) {
      this.logger.error("Agent Execution Failed:", e);
      return `Agent Error: ${e.message}`;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const sanitizedText = text.replace(/\n/g, " ");
    const genAI = await this.getGeminiClient();
    const openai = await this.getOpenAIClient();

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await model.embedContent(sanitizedText);
        return Array.from(result.embedding.values);
      } catch (e) {
        this.logger.error("Gemini Embedding Failed, falling back to OpenAI if possible:", e);
      }
    }

    if (!openai) throw new Error("No AI provider configured for embeddings");
    const result = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: sanitizedText,
      dimensions: 1536,
    });
    return result.data[0].embedding;
  }

  async findRelevantChunks(knowledgeBaseId: string, query: string, limit: number = 3): Promise<string[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const chunks = await this.chunkRepo.find({ where: { knowledgeBaseId } });
    if (chunks.length === 0) return [];

    const scoredChunks = chunks
      .map((chunk) => {
        let dbEmbedding: number[] = [];
        if (typeof chunk.embedding === "string") {
          try { dbEmbedding = JSON.parse(chunk.embedding); } catch {}
        } else if (Array.isArray(chunk.embedding)) {
          dbEmbedding = chunk.embedding;
        }
        if (dbEmbedding.length !== queryEmbedding.length) return { content: chunk.content, score: 0 };
        return { content: chunk.content, score: this.cosineSimilarity(queryEmbedding, dbEmbedding) };
      })
      .filter((c) => c.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scoredChunks.map((c) => c.content);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const divisor = Math.sqrt(normA) * Math.sqrt(normB);
    return divisor === 0 ? 0 : dotProduct / divisor;
  }
}
