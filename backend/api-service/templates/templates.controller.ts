import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { TemplatesService } from "./templates.service";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";

@Controller("templates")
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll(@UserTenant() tenantId: string) {
    return this.templatesService.findAll(tenantId);
  }

  @Post("sync")
  sync(@UserTenant() tenantId: string) {
    return this.templatesService.sync(tenantId);
  }

  @Post()
  create(@UserTenant() tenantId: string, @Body() body: any) {
    return this.templatesService.create(tenantId, body);
  }
}
