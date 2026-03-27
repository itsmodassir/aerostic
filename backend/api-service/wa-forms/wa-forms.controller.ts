import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "@api/auth/decorators/user-tenant.decorator";
import { WaFormsService } from "./wa-forms.service";

@Controller("wa-forms")
@UseGuards(JwtAuthGuard)
export class WaFormsController {
  constructor(private readonly waFormsService: WaFormsService) {}

  @Get()
  findAll(@UserTenant() tenantId: string) {
    return this.waFormsService.findAll(tenantId);
  }

  @Get("published")
  findPublished(@UserTenant() tenantId: string) {
    return this.waFormsService.findPublished(tenantId);
  }

  @Get(":id")
  findOne(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.waFormsService.findOne(tenantId, id);
  }

  @Post()
  create(
    @UserTenant() tenantId: string,
    @Body()
    body: {
      name: string;
      description?: string;
      schemaJson?: Record<string, any>;
      metaCategories?: string[];
    },
  ) {
    return this.waFormsService.create(tenantId, body);
  }

  @Put(":id")
  update(
    @UserTenant() tenantId: string,
    @Param("id") id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      schemaJson?: Record<string, any>;
      metaCategories?: string[];
      status?: "draft" | "published" | "archived";
    },
  ) {
    return this.waFormsService.update(tenantId, id, body);
  }

  @Post(":id/publish")
  publish(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.waFormsService.publish(tenantId, id);
  }

  @Delete(":id")
  remove(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.waFormsService.remove(tenantId, id);
  }
}

