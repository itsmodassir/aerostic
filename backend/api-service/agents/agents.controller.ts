import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { AgentsService } from "./agents.service";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "@api/auth/decorators/user-tenant.decorator";

@Controller("agents")
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  create(@UserTenant() tenantId: string, @Body() createAgentDto: any) {
    const { tenantId: _tenantId, ...data } = createAgentDto;
    return this.agentsService.create(tenantId, data);
  }

  @Get()
  findAll(@UserTenant() tenantId: string) {
    return this.agentsService.findAll(tenantId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @UserTenant() tenantId: string) {
    return this.agentsService.findOne(id, tenantId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @UserTenant() tenantId: string,
    @Body() updateAgentDto: any,
  ) {
    const { tenantId: _tenantId, ...data } = updateAgentDto;
    return this.agentsService.update(id, tenantId, data);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @UserTenant() tenantId: string) {
    return this.agentsService.remove(id, tenantId);
  }
}
