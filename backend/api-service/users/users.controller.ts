import { Controller, Post, Body, Get, Patch, UseGuards, Req } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch("me")
  updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get("me/notifications")
  getNotifications(@UserTenant() tenantId: string) {
    return this.usersService.getNotifications(tenantId);
  }

  // Usually protected by Super Admin guard
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@UserTenant() tenantId: string) {
    return this.usersService.findAllByTenant(tenantId);
  }
}
