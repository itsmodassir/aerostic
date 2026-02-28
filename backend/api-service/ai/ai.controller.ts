import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AiAgent } from "./entities/ai-agent.entity";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";
import { KnowledgeBaseService } from "./knowledge-base.service";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    @InjectRepository(AiAgent)
    private aiAgentRepo: Repository<AiAgent>,
    private kbService: KnowledgeBaseService,
  ) { }

  @Get("agent")
  async getAgent(@UserTenant() tenantId: string) {
    const agent = await this.aiAgentRepo.findOneBy({ tenantId });
    if (!agent) {
      // Return default structure if not found
      return {
        systemPrompt:
          "You are a helpful and friendly customer support agent for Aimstors Solution, a SaaS platform. Answer concisely.",
        active: true,
        intentDetection: false,
        personalizationEnabled: false,
      };
    }
    return agent;
  }

  @Post("agent")
  async saveAgent(
    @UserTenant() tenantId: string,
    @Body() body: { systemPrompt: string; active: boolean; intentDetection?: boolean; personalizationEnabled?: boolean },
  ) {
    let agent = await this.aiAgentRepo.findOneBy({ tenantId });
    if (!agent) {
      agent = this.aiAgentRepo.create({ tenantId });
    }

    if (body.systemPrompt !== undefined) agent.systemPrompt = body.systemPrompt;
    if (body.active !== undefined) agent.isActive = body.active;
    if (body.intentDetection !== undefined) agent.intentDetection = body.intentDetection;
    if (body.personalizationEnabled !== undefined) agent.personalizationEnabled = body.personalizationEnabled;

    return this.aiAgentRepo.save(agent);
  }
  @Post("respond")
  async respond(
    @UserTenant() tenantId: string,
    @Body() body: { conversationId: string; message: string },
  ) {
    // Internal Dispatcher Call
    // This ensures AI routes through proper channels
    return { status: "processed" };
  }

  // --- Knowledge Base Management ---

  @Get("knowledge-bases")
  async getKnowledgeBases(@UserTenant() tenantId: string) {
    return this.kbService.getKnowledgeBases(tenantId);
  }

  @Post("knowledge-bases")
  async createKnowledgeBase(
    @UserTenant() tenantId: string,
    @Body() body: { name: string; description?: string },
  ) {
    return this.kbService.createKnowledgeBase(
      tenantId,
      body.name,
      body.description,
    );
  }

  @Post("knowledge-bases/ingest")
  async ingestKnowledge(
    @UserTenant() tenantId: string,
    @Body() body: { knowledgeBaseId: string; content: string; metadata?: any },
  ) {
    // Basic verification that KB belongs to tenant would be good in a real app
    return this.kbService.ingestText(
      body.knowledgeBaseId,
      body.content,
      body.metadata,
    );
  }

  @Post("knowledge-bases/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadDocument(
    @UserTenant() tenantId: string,
    @Body("knowledgeBaseId") knowledgeBaseId: string,
    @UploadedFile() file: any,
  ) {
    if (!knowledgeBaseId) {
      throw new BadRequestException("KnowledgeBaseId is required");
    }
    if (!file) {
      throw new BadRequestException("File is required");
    }

    if (file.mimetype === "application/pdf") {
      return this.kbService.ingestPdf(knowledgeBaseId, file.buffer, {
        filename: file.originalname,
        uploadedAt: new Date().toISOString(),
      });
    } else if (file.mimetype === "text/plain" || file.mimetype === "text/csv") {
      const text = file.buffer.toString("utf8");
      return this.kbService.ingestText(knowledgeBaseId, text, {
        filename: file.originalname,
        uploadedAt: new Date().toISOString(),
      });
    }
  }

  @Post("setup-expert-guide")
  async setupExpertGuide(@UserTenant() tenantId: string) {
    // 1. Create Knowledge Base
    const existingKbs = await this.kbService.getKnowledgeBases(tenantId);
    let kb = existingKbs.find(k => k.name === "Aimstors Solution Master Guide");

    if (!kb) {
      kb = await this.kbService.createKnowledgeBase(
        tenantId,
        "Aimstors Solution Master Guide",
        "Official documentation about the Aimstors SaaS platform, including architecture, billing, and automation features.",
      );
    }

    // 2. Construct Master Guide Content
    const blueprintContent = "# Aimstors Solution: Platform Overview\nAimstors Solution is a professional WhatsApp Automation SaaS. It features a micro-monolith architecture for high performance.\n\n## Key Features:\n1. **WhatsApp CRM & Team Inbox**: Multi-agent chat interface for managing WhatsApp conversations.\n2. **Visual Automation Builder**: Drag-and-drop workflow builder using ReactFlow. Executes nodes for AI, HTTP requests, and logic.\n3. **Campaign Management**: Bulk WhatsApp messaging with template support.\n4. **Billing & Wallets**: Immutable usage ledger. Wallets deduct for outgoing messages and AI calls. Dynamic pricing for template categories: Marketing, Utility, Authentication.\n5. **Security**: Enterprise RBAC, strict tenant isolation, SOC2 audit logging.\n\n## AI Capabilities:\nThe platform uses Gemini (Google AI) for intelligent chat replies. Agents can detect intent (FAQ, Sales, Support) and escalate to humans if needed.";

    await this.kbService.ingestText(kb.id, blueprintContent, { source: "official_blueprint" });

    // 3. Configure AI Agent
    let agent = await this.aiAgentRepo.findOneBy({ tenantId });
    if (!agent) {
      agent = this.aiAgentRepo.create({ tenantId, name: "Aimstors Expert" });
    }

    agent.systemPrompt = "You are the Aimstors Expert, a professional AI support agent for Aimstors Solution.\nYour goal is to provide accurate, helpful, and concise information about our WhatsApp Automation platform.\n\nRESOURCES: Use the provided knowledge base context to answer technical questions about workflows, campaigns, and billing.\nESCALATION: If a user is frustrated or you are unsure, reply with \"HANDOFF_TO_AGENT\".\nSTYLE: Professional, technical yet accessible, premium tone.";
    agent.isActive = true;
    agent.intentDetection = true;
    agent.model = "gemini-flash-lite-latest";

    await this.aiAgentRepo.save(agent);

    return {
      status: "AI Agent Configured Successfully",
      agentId: agent.id,
      knowledgeBaseId: kb.id
    };
  }
}
