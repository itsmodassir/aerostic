import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Agent } from "./entities/agent.entity";

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentRepo: Repository<Agent>,
  ) {}

  async create(tenantId: string, data: any) {
    const agent = this.agentRepo.create({
      tenantId,
      ...data,
    });
    return this.agentRepo.save(agent);
  }

  async findAll(tenantId: string) {
    return this.agentRepo.find({
      where: { tenantId },
      select: [
        "id",
        "name",
        "description",
        "type",
        "isActive",
        "totalConversations",
        "successfulResolutions",
        "handoffsTriggered",
        "createdAt",
        "updatedAt", // Exclude flowConfig and systemPrompt
      ],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string, tenantId: string) {
    const agent = await this.agentRepo.findOne({ where: { id, tenantId } });
    if (!agent) throw new NotFoundException("Agent not found");
    return agent;
  }

  async update(id: string, tenantId: string, data: any) {
    const agent = await this.findOne(id, tenantId);
    Object.assign(agent, data);
    return this.agentRepo.save(agent);
  }

  async remove(id: string, tenantId: string) {
    const agent = await this.findOne(id, tenantId);
    return this.agentRepo.remove(agent);
  }
}
