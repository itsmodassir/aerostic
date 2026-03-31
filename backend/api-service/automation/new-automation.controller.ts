import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  AutomationFlow,
  AutomationNode,
  AutomationEdge,
  ExecutionStatus,
  AutomationExecution,
} from "@shared/database/entities/core/automation-flow.entity";
import { NewAutomationService } from "./new-automation.service";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";
import { TenantGuard } from "@shared/guards/tenant.guard";
import { AuthorizationGuard } from "@shared/authorization/guards/authorization.guard";
import { Authorize } from "@shared/authorization/decorators/authorize.decorator";

@Controller("new-automation")
@UseGuards(JwtAuthGuard, TenantGuard, AuthorizationGuard)
export class NewAutomationController {
  constructor(
    private readonly automationService: NewAutomationService,
    @InjectRepository(AutomationFlow)
    private flowRepo: Repository<AutomationFlow>,
    @InjectRepository(AutomationNode)
    private nodeRepo: Repository<AutomationNode>,
    @InjectRepository(AutomationEdge)
    private edgeRepo: Repository<AutomationEdge>,
    @InjectRepository(AutomationExecution)
    private executionRepo: Repository<AutomationExecution>,
  ) {}

  @Get()
  @Authorize({ resource: "automation", action: "read" })
  async getAutomations(@UserTenant() tenantId: string) {
    return this.flowRepo.find({
      where: { tenantId },
      order: { updatedAt: "DESC" },
    });
  }

  @Get(":id")
  @Authorize({ resource: "automation", action: "read" })
  async getAutomation(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.flowRepo.findOne({
      where: { id, tenantId },
      relations: ["nodes", "edges"],
    });
  }

  @Post()
  @Authorize({ resource: "automation", action: "create" })
  async createAutomation(
    @UserTenant() tenantId: string,
    @Body() body: Partial<AutomationFlow> & { nodes: any[]; edges: any[] },
  ) {
    const flow = this.flowRepo.create({
      ...body,
      tenantId,
    });
    const savedFlow = await this.flowRepo.save(flow);

    if (body.nodes) {
      const nodes = this.nodeRepo.create(
        body.nodes.map((n: any) => ({ ...n, automation: savedFlow })),
      );
      await this.nodeRepo.save(nodes);
    }

    if (body.edges) {
      const edges = this.edgeRepo.create(
        body.edges.map((e: any) => ({ ...e, automation: savedFlow })),
      );
      await this.edgeRepo.save(edges);
    }

    return savedFlow;
  }

  @Put(":id")
  @Authorize({ resource: "automation", action: "update" })
  async updateAutomation(
    @UserTenant() tenantId: string,
    @Param("id") id: string,
    @Body() body: any,
  ) {
    const flow = await this.flowRepo.findOne({ where: { id, tenantId } });
    if (!flow) throw new Error("Automation not found");

    if (body.name) flow.name = body.name;
    if (body.status) flow.status = body.status;
    if (body.trigger) flow.trigger = body.trigger;

    await this.flowRepo.save(flow);

    if (body.nodes) {
      await this.nodeRepo.delete({ automation: { id } });
      const nodes = this.nodeRepo.create(
        body.nodes.map((n: any) => ({ ...n, automation: flow })),
      );
      await this.nodeRepo.save(nodes);
    }

    if (body.edges) {
      await this.edgeRepo.delete({ automation: { id } });
      const edges = this.edgeRepo.create(
        body.edges.map((e: any) => ({ ...e, automation: flow })),
      );
      await this.edgeRepo.save(edges);
    }

    return flow;
  }

  @Delete(":id")
  @Authorize({ resource: "automation", action: "delete" })
  async deleteAutomation(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.flowRepo.delete({ id, tenantId });
  }

  @Post(":id/execute")
  @Authorize({ resource: "automation", action: "execute" })
  async executeAutomation(
    @UserTenant() tenantId: string,
    @Param("id") id: string,
    @Body() body: { contactId?: string; triggerData?: any },
  ) {
    const execution = this.executionRepo.create({
      automation: { id } as any,
      contact: body.contactId ? ({ id: body.contactId } as any) : undefined,
      triggerData: body.triggerData || {},
      status: ExecutionStatus.RUNNING,
    });

    const savedExecution = await this.executionRepo.save(execution);
    await this.automationService.executeAutomation(savedExecution.id);
    return savedExecution;
  }
}
