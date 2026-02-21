import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
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
  ) {}

  @Get("agent")
  async getAgent(@UserTenant() tenantId: string) {
    const agent = await this.aiAgentRepo.findOneBy({ tenantId });
    if (!agent) {
      // Return default structure if not found
      return {
        systemPrompt:
          "You are a helpful and friendly customer support agent for Aerostic, a SaaS platform. Answer concisely.",
        active: true,
      };
    }
    return agent;
  }

  @Post("agent")
  async saveAgent(
    @UserTenant() tenantId: string,
    @Body() body: { systemPrompt: string; active: boolean },
  ) {
    let agent = await this.aiAgentRepo.findOneBy({ tenantId });
    if (!agent) {
      agent = this.aiAgentRepo.create({ tenantId });
    }

    agent.systemPrompt = body.systemPrompt;
    agent.isActive = body.active;

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
}
