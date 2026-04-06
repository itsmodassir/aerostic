import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
} from "@nestjs/common";
import { CampaignsService } from "./campaigns.service";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { TenantGuard } from "@shared/guards/tenant.guard";
import { Authorize } from "@shared/authorization/decorators/authorize.decorator";
import { AuthorizationGuard } from "@shared/authorization/guards/authorization.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";
import { Public } from "../auth/decorators/public.decorator";

@Controller("campaigns")
@UseGuards(JwtAuthGuard, TenantGuard, AuthorizationGuard) // AuthorizationGuard MUST be after JwtAuthGuard
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @Authorize({ resource: "campaign", action: "create" })
  create(@UserTenant() tenantId: string, @Body() body: any) {
    return this.campaignsService.create(tenantId, body);
  }

  @Get("recent")
  findRecent(@UserTenant() tenantId: string) {
    return this.campaignsService.getRecent(tenantId);
  }

  @Get()
  @Authorize({ resource: "campaign", action: "read" })
  findAll(@UserTenant() tenantId: string) {
    return this.campaignsService.findAll(tenantId);
  }

  @Get("triggers")
  @Authorize({ resource: "campaign", action: "read" })
  findTriggers(@UserTenant() tenantId: string) {
    return this.campaignsService.findTriggers(tenantId);
  }

  @Post("triggers")
  @Authorize({ resource: "campaign", action: "create" })
  createTrigger(@UserTenant() tenantId: string, @Body() body: any) {
    return this.campaignsService.createTrigger(tenantId, body);
  }

  @Delete("triggers/:id")
  @Authorize({ resource: "campaign", action: "delete" })
  disableTrigger(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.campaignsService.disableTrigger(tenantId, id);
  }

  /**
   * External Webhook Trigger (Public with API Key)
   */
  @Public()
  @Post("triggers/:apiKey")
  async handleTrigger(
    @Param("apiKey") apiKey: string,
    @Body() payload: { phone: string, name?: string, variables?: any }
  ) {
    return this.campaignsService.triggerSingle(apiKey, payload);
  }

  @Post(":id/send")
  @Authorize({ resource: "campaign", action: "create" })
  send(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.campaignsService.dispatch(tenantId, id);
  }
}
