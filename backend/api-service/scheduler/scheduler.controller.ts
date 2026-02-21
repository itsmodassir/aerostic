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
import { SchedulerService } from "./scheduler.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";

@Controller("scheduler")
@UseGuards(JwtAuthGuard)
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post()
  create(
    @UserTenant() tenantId: string,
    @Body() createDto: CreateAppointmentDto,
  ) {
    return this.schedulerService.create(createDto, tenantId);
  }

  @Get()
  findAll(@UserTenant() tenantId: string) {
    return this.schedulerService.findAll(tenantId);
  }

  @Get(":id")
  findOne(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.schedulerService.findOne(id, tenantId);
  }

  @Patch(":id")
  update(
    @UserTenant() tenantId: string,
    @Param("id") id: string,
    @Body() updateData: any,
  ) {
    return this.schedulerService.update(id, tenantId, updateData);
  }

  @Delete(":id")
  remove(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.schedulerService.remove(id, tenantId);
  }
}
