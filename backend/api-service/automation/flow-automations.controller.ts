import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Connection } from "typeorm";
import { FlowAutomation } from "./entities/flow/flow-automation.entity";
import { FlowNode } from "./entities/flow/flow-node.entity";
import { FlowEdge } from "./entities/flow/flow-edge.entity";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("flow-automations")
@UseGuards(JwtAuthGuard)
export class FlowAutomationsController {
  constructor(
    @InjectRepository(FlowAutomation)
    private automationRepo: Repository<FlowAutomation>,
    @InjectRepository(FlowNode)
    private nodeRepo: Repository<FlowNode>,
    @InjectRepository(FlowEdge)
    private edgeRepo: Repository<FlowEdge>,
    private connection: Connection,
  ) {}

  @Get()
  async getAutomations(@Request() req: any, @Query("channelId") channelId?: string) {
    const tenantId = req.user.tenantId;
    const query: any = { tenantId };
    if (channelId) query.channelId = channelId;

    return this.automationRepo.find({
      where: query,
      order: { createdAt: "DESC" },
    });
  }

  @Get(":id")
  async getAutomation(@Request() req: any, @Param("id") id: string) {
    const tenantId = req.user.tenantId;
    const automation = await this.automationRepo.findOne({
      where: { id, tenantId },
      relations: ["nodes", "edges"],
    });

    if (!automation) {
      throw new NotFoundException("Automation not found");
    }

    return automation;
  }

  @Post()
  async createAutomation(@Request() req: any, @Body() body: any) {
    const tenantId = req.user.tenantId;
    const { name, description, trigger, triggerConfig, nodes = [], edges = [] } = body;

    return this.connection.transaction(async (manager) => {
      // 1. Create Automation
      const automation = manager.create(FlowAutomation, {
        tenantId,
        name,
        description,
        trigger,
        triggerConfig: triggerConfig || {},
        createdById: req.user.id,
        status: "inactive",
      });
      const savedAutomation = await manager.save(automation);

      // 2. Create Nodes
      if (nodes.length > 0) {
        const flowNodes = nodes.map((node: any) =>
          manager.create(FlowNode, {
            automationId: savedAutomation.id,
            nodeId: node.id,
            type: node.type,
            subtype: node.subtype || node.type,
            position: node.position,
            measured: node.measured,
            data: node.data,
            connections: node.connections || [],
          }),
        );
        await manager.save(flowNodes);
      }

      // 3. Create Edges
      if (edges.length > 0) {
        const flowEdges = edges.map((edge: any) =>
          manager.create(FlowEdge, {
            automationId: savedAutomation.id,
            sourceNodeId: edge.source,
            targetNodeId: edge.target,
            animated: !!edge.animated,
          }),
        );
        await manager.save(flowEdges);
      }

      return savedAutomation;
    });
  }

  @Patch(":id")
  async updateAutomation(@Request() req: any, @Param("id") id: string, @Body() body: any) {
    const tenantId = req.user.tenantId;
    const { name, description, trigger, triggerConfig, status, nodes, edges } = body;

    const automation = await this.automationRepo.findOne({
      where: { id, tenantId },
    });

    if (!automation) {
      throw new NotFoundException("Automation not found");
    }

    return this.connection.transaction(async (manager) => {
      // 1. Update basic info
      await manager.update(FlowAutomation, id, {
        name: name !== undefined ? name : automation.name,
        description: description !== undefined ? description : automation.description,
        trigger: trigger !== undefined ? trigger : automation.trigger,
        triggerConfig: triggerConfig !== undefined ? triggerConfig : automation.triggerConfig,
        status: status !== undefined ? status : automation.status,
        updatedAt: new Date(),
      });

      // 2. Sync Nodes (Delete and Re-insert)
      if (nodes) {
        await manager.delete(FlowNode, { automationId: id });
        if (nodes.length > 0) {
          const flowNodes = nodes.map((node: any) =>
            manager.create(FlowNode, {
              automationId: id,
              nodeId: node.id,
              type: node.type,
              subtype: node.subtype || node.type,
              position: node.position,
              measured: node.measured,
              data: node.data,
              connections: node.connections || [],
            }),
          );
          await manager.save(flowNodes);
        }
      }

      // 3. Sync Edges (Delete and Re-insert)
      if (edges) {
        await manager.delete(FlowEdge, { automationId: id });
        if (edges.length > 0) {
          const flowEdges = edges.map((edge: any) =>
            manager.create(FlowEdge, {
              automationId: id,
              sourceNodeId: edge.source,
              targetNodeId: edge.target,
              animated: !!edge.animated,
            }),
          );
          await manager.save(flowEdges);
        }
      }

      return manager.findOne(FlowAutomation, {
        where: { id },
        relations: ["nodes", "edges"],
      });
    });
  }

  @Delete(":id")
  async deleteAutomation(@Request() req: any, @Param("id") id: string) {
    const tenantId = req.user.tenantId;
    const result = await this.automationRepo.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException("Automation not found");
    }
    return { success: true };
  }
}
