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
import { ReferralsService } from "./referrals.service";
import { CreateReferralDto } from "./dto/create-referral.dto";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";

@Controller("referrals")
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  create(@UserTenant() tenantId: string, @Body() createDto: CreateReferralDto) {
    return this.referralsService.create(createDto, tenantId);
  }

  @Get()
  findAll(@UserTenant() tenantId: string) {
    return this.referralsService.findAll(tenantId);
  }

  @Get(":id")
  findOne(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.referralsService.findOne(id, tenantId);
  }

  @Patch(":id")
  update(
    @UserTenant() tenantId: string,
    @Param("id") id: string,
    @Body() updateData: any,
  ) {
    return this.referralsService.update(id, tenantId, updateData);
  }

  @Delete(":id")
  remove(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.referralsService.remove(id, tenantId);
  }
}
