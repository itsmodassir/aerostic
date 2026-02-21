import {
  Body,
  Controller,
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
import { UserTenant } from "../auth/decorators/user-tenant.decorator";

@Controller("campaigns")
@UseGuards(JwtAuthGuard, TenantGuard) // TenantGuard still sets req.membership, which some logic may need
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @Authorize({ resource: "campaign", action: "create" })
  create(@UserTenant() tenantId: string, @Body() body: any) {
    return this.campaignsService.create(tenantId, body);
  }

  @Get()
  @Authorize({ resource: "campaign", action: "read" })
  findAll(@UserTenant() tenantId: string) {
    return this.campaignsService.findAll(tenantId);
  }

  @Post(":id/send")
  @Authorize({ resource: "campaign", action: "execute" })
  send(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.campaignsService.dispatch(tenantId, id);
  }
}
