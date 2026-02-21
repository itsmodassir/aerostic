import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AutomationService } from "./automation.service";
import { WorkflowsService } from "./workflows.service";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";

import { TenantGuard } from "@shared/guards/tenant.guard";
import { Authorize } from "@shared/authorization/decorators/authorize.decorator";

@Controller("automation")
@UseGuards(JwtAuthGuard, TenantGuard)
export class AutomationController {
  constructor(
    private readonly automationService: AutomationService,
    private readonly workflowsService: WorkflowsService,
  ) {}

  @Post("rules")
  @Authorize({ resource: "automation", action: "create" })
  createRule(@UserTenant() tenantId: string, @Body() body: any) {
    return this.automationService.createRule(tenantId, body);
  }

  @Get("rules")
  @Authorize({ resource: "automation", action: "read" })
  getRules(@UserTenant() tenantId: string) {
    return this.automationService.getRules(tenantId);
  }

  @Post("test-execute")
  @Authorize({ resource: "automation", action: "execute" })
  async executeTest(
    @UserTenant() tenantId: string,
    @Body() body: { workflowId: string; message: string },
  ) {
    await this.workflowsService.executeTest(
      tenantId,
      body.workflowId,
      body.message,
    );
    return { status: "test_started" };
  }

  @Post("broadcast")
  @Authorize({ resource: "automation", action: "execute" })
  async executeBroadcast(
    @UserTenant() tenantId: string,
    @Body() body: { workflowId: string; audience: any[] },
  ) {
    await this.workflowsService.executeBroadcast(
      tenantId,
      body.workflowId,
      body.audience,
    );
    return { status: "broadcast_started", count: body.audience.length };
  }
}
