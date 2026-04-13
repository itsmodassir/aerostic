import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from "@nestjs/common";
import { PlansService } from "../plans.service";
import { Plan } from "@shared/database/entities/billing/plan.entity";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { RequireRole } from "@shared/decorators/require-role.decorator";
import { SystemRole } from "@shared/types/roles";
import { Request } from "@nestjs/common";

@Controller("admin/plans")
@RequireRole(SystemRole.RESELLER_ADMIN) // Allows Reseller and Platform/Super admins
export class PlansController {
  constructor(private readonly plansService: PlansService) { }

  @Get()
  findAll(@Req() req: any) {
    // Platform Admins see global plans. Resellers see their own custom plans.
    const isPlatformAdmin = [SystemRole.PLATFORM_ADMIN, SystemRole.SUPER_ADMIN].includes(req.user.systemRole);
    const tenantId = isPlatformAdmin ? null : req.user.tenantId;
    return this.plansService.findAll(tenantId);
  }

  @Post()
  create(@Body() createPlanDto: Partial<Plan>, @Req() req: any) {
    const isPlatformAdmin = [SystemRole.PLATFORM_ADMIN, SystemRole.SUPER_ADMIN].includes(req.user.systemRole);
    const tenantId = isPlatformAdmin ? null : req.user.tenantId;
    return this.plansService.create({ ...createPlanDto, tenantId });
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updatePlanDto: Partial<Plan>, @Req() req: any) {
    const isPlatformAdmin = [SystemRole.PLATFORM_ADMIN, SystemRole.SUPER_ADMIN].includes(req.user.systemRole);
    const tenantId = isPlatformAdmin ? null : req.user.tenantId;
    return this.plansService.update(id, updatePlanDto, tenantId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: any) {
    const isPlatformAdmin = [SystemRole.PLATFORM_ADMIN, SystemRole.SUPER_ADMIN].includes(req.user.systemRole);
    const tenantId = isPlatformAdmin ? null : req.user.tenantId;
    return this.plansService.remove(id, tenantId);
  }
}
