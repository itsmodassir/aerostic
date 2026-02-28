import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AiAgent } from "./entities/ai-agent.entity";
import { MessagesService } from "../messages/messages.service";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { KnowledgeChunk } from "./entities/knowledge-chunk.entity";
import { KnowledgeBase } from "./entities/knowledge-base.entity";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

@Injectable()
export class AiService {
  private openai: OpenAI;
  private genAI: GoogleGenerativeAI;

  constructor(
    private messagesService: MessagesService,
    private configService: ConfigService,
    @InjectRepository(AiAgent)
    private aiAgentRepo: Repository<AiAgent>,
    @InjectRepository(KnowledgeChunk)
    private chunkRepo: Repository<KnowledgeChunk>,
    @InjectRepository(KnowledgeBase)
    private kbRepo: Repository<KnowledgeBase>,
  ) {
    // Rely strictly on the environment variable for security
    const openaiKey = this.configService.get("OPENAI_API_KEY");
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }

    const geminiKey = this.configService.get("GEMINI_API_KEY");
    if (geminiKey) {
      this.genAI = new GoogleGenerativeAI(geminiKey);
    }
  }

  async process(
    tenantId: string,
    from: string,
    messageBody: string,
    options?: { model?: string; systemPrompt?: string },
  ) {
    if (!this.openai && !this.genAI) {
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
        "You are a helpful and friendly customer support agent for Aimstors Solution, a SaaS platform. Answer concisely.";

      const isActive = agent ? agent.isActive : true;

      if (!isActive && !options?.systemPrompt) {
        // Only block if using global agent and it's inactive.
        // If workflow explicitly invoked AI, we should probably run it.
        return;
      }

      // Model Selection (Prioritize Gemini Flash if available)
      const modelName = options?.model || (this.genAI ? "gemini-flash-lite-latest" : "gpt-4o");
      const isGemini = modelName.toLowerCase().includes("gemini");

      let contextStr = "";

      // 1. Intent Detection
      if (agent?.intentDetection) {
        const intentPrompt = `Analyze the intent of this user message: "${messageBody}". Is it a simple FAQ, a complex issue requiring HUMAN_SUPPORT, or a SALES inquiry? Reply ONLY with the exact category name: FAQ, HUMAN_SUPPORT, SALES, or OTHER.`;
        let intent = "FAQ";

        if (isGemini && this.genAI) {
          const model = this.genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
          const result = await model.generateContent(intentPrompt);
          intent = result.response.text().trim();
        } else if (this.openai) {
          const intentCompletion = await this.openai.chat.completions.create({
            model: isGemini ? "gpt-4o" : modelName,
            messages: [{ role: "user", content: intentPrompt }],
            temperature: 0,
          });
          intent = intentCompletion.choices[0]?.message?.content?.trim() || "FAQ";
        }

        if (intent.includes('HUMAN_SUPPORT')) {
          this.messagesService.send({
            tenantId,
            to: from,
            type: "text",
            payload: { text: "I noticed your request is quite specific. Let me hand you over to a human agent right away." },
          });
          return;
        }
        contextStr += `[Detected User Intent: ${intent}]\n`;
      }

      // 2. Personalization
      if (agent?.personalizationEnabled) {
        contextStr += `[Personalization: Adopt a warm, adaptive tone matching the user's implicit sentiment.]\n`;
      }

      // 3. Knowledge Base / RAG
      const kbs = await this.kbRepo.find({ where: { tenantId } });
      let kbContext = "";
      for (const kb of kbs) {
        const chunks = await this.findRelevantChunks(kb.id, messageBody, 3);
        if (chunks.length > 0) {
          kbContext += chunks.join("\n---\n") + "\n";
        }
      }

      if (kbContext) {
        contextStr += `\n[Reference Knowledge Base Extracts (use this to answer accurately)]:\n${kbContext}\n`;
      }

      // Primary Completion
      let aiReply = "";

      if (isGemini && this.genAI) {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const prompt = `${systemPrompt}\n\nContext:\n${contextStr}\n\nNote: If you are extremely uncertain or need a human, reply exactly with "HANDOFF_TO_AGENT".\n\nUser: ${messageBody}`;
        const result = await model.generateContent(prompt);
        aiReply = result.response.text();
      } else if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "system", content: contextStr },
            { role: "system", content: `Instruction: You are an AI agent. Answer the User based on the System and Context instructions. If you are extremely uncertain or need a human, reply exactly with "HANDOFF_TO_AGENT".` },
            { role: "user", content: messageBody }
          ],
        });
        aiReply = completion.choices[0]?.message?.content || "";
      }

      if (aiReply.includes("HANDOFF_TO_AGENT")) {
        return;
      }

      // Send the reply
      await this.messagesService.send({
        tenantId,
        to: from,
        type: "text",
        payload: { text: aiReply },
      });
    } catch (e) {
      console.error("AI Generation Failed", e);
    }
  }

  async runAgent(
    tenantId: string,
    messageBody: string,
    tools: any[],
    systemPrompt: string,
  ): Promise<string> {
    if (!this.openai) return "AI not configured";

    // 1. Prepare Tools
    const toolMap = new Map(tools.map((t) => [t.name, t]));

    const formattedTools = tools.map(t => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      }
    }));

    // 2. Start Chat Session History
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "system", content: "Understood. I am ready to help." },
      { role: "user", content: messageBody }
    ];

    try {
      if (this.openai) {
        // 3. Execution Loop (OpenAI)
        let turns = 0;
        const MAX_TURNS = 10;

        while (turns < MAX_TURNS) {
          const completion = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            tools: formattedTools.length > 0 ? formattedTools : undefined,
          });

          const responseMessage = completion.choices[0]?.message;
          if (!responseMessage) break;

          messages.push(responseMessage);

          const toolCalls = responseMessage.tool_calls;

          // If no tool calls, we are done
          if (!toolCalls || toolCalls.length === 0) {
            return responseMessage.content || "";
          }

          // Execute all requested tools
          for (const call of toolCalls) {
            if (call.type !== "function") continue;

            const tool = toolMap.get(call.function.name);
            let functionArgs;
            try {
              functionArgs = JSON.parse(call.function.arguments);
            } catch (e) {
              functionArgs = {};
            }

            if (tool) {
              try {
                console.log(`[Agent] Calling Tool: ${call.function.name}`);
                const output = await tool.execute(functionArgs);

                const content = typeof output === "string" ? output : JSON.stringify(output);
                messages.push({
                  tool_call_id: call.id,
                  role: "tool",
                  name: call.function.name,
                  content: content,
                });
              } catch (err: any) {
                console.error(`[Agent] Tool Error (${call.function.name}):`, err);
                messages.push({
                  tool_call_id: call.id,
                  role: "tool",
                  name: call.function.name,
                  content: `Error: ${err.message}`,
                });
              }
            } else {
              messages.push({
                tool_call_id: call.id,
                role: "tool",
                name: call.function.name,
                content: `Error: Tool ${call.function.name} not found`,
              });
            }
          }

          turns++;
        }
      } else if (this.genAI) {
        // Simple Gemini Fallback (No complex tool loop for now as Gemini tool syntax differs)
        const model = this.genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
        const result = await model.generateContent(`${systemPrompt}\n\nUser: ${messageBody}`);
        return result.response.text();
      }

      return messages[messages.length - 1]?.content || "Agent execution finished.";
    } catch (e: any) {
      console.error("Agent Execution Failed:", e);
      return `Agent Error: ${e.message}`;
    }
  }

  /**
   * Generates a vector embedding for a given text using OpenAI or Gemini
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const sanitizedText = text.replace(/\n/g, " ");

    if (this.genAI) {
      // Use Gemini for embeddings if available
      try {
        const model = this.genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await model.embedContent(sanitizedText);
        return Array.from(result.embedding.values);
      } catch (e) {
        console.error("Gemini Embedding Failed, falling back to OpenAI if possible:", e);
      }
    }

    if (!this.openai) throw new Error("AI (OpenAI/Gemini) not configured for embeddings");

    const result = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: sanitizedText,
      dimensions: 1536
    });

    return result.data[0].embedding;
  }

  /**
   * Finds the most relevant chunks in a knowledge base using cosine similarity
   */
  async findRelevantChunks(
    knowledgeBaseId: string,
    query: string,
    limit: number = 3,
  ): Promise<string[]> {
    const queryEmbedding = await this.generateEmbedding(query);

    // Fetch chunks for this KB
    const chunks = await this.chunkRepo.find({
      where: { knowledgeBaseId },
    });

    if (chunks.length === 0) return [];

    // Calculate similarity and sort
    const scoredChunks = chunks
      .map((chunk) => {
        let dbEmbedding: number[] = [];
        if (typeof chunk.embedding === 'string') {
          try { dbEmbedding = JSON.parse(chunk.embedding); } catch (e) { }
        } else if (Array.isArray(chunk.embedding)) {
          dbEmbedding = chunk.embedding;
        }

        // Handle dimension mismatch gracefully (e.g. if mixed models were used)
        if (dbEmbedding.length !== queryEmbedding.length) {
          return { content: chunk.content, score: 0 };
        }

        return {
          content: chunk.content,
          score: this.cosineSimilarity(queryEmbedding, dbEmbedding),
        };
      })
      .filter(c => c.score > 0.3) // Filter out low quality matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scoredChunks.map((c) => c.content);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
      return 0; // Return zero similarity if invalid
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const divisor = (Math.sqrt(normA) * Math.sqrt(normB));
    return divisor === 0 ? 0 : dotProduct / divisor;
  }
}
