import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Delete,
  Param,
  ForbiddenException,
} from "@nestjs/common";
import { ApiKeyService } from "./api-keys.service";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { Authorize } from "@shared/authorization/decorators/authorize.decorator";

@Controller("api-keys")
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private apiKeyService: ApiKeyService) {}

  @Post()
  @Authorize({ resource: "apiKey", action: "create" })
  async create(
    @Req() req: any,
    @Body("name") name: string,
    @Body("environment") environment: "live" | "test",
    @Body("permissions") permissions: string[],
  ) {
    // Ensure tenant_id match for non-platform admins
    const tenantId = req.user.tenantId;

    return this.apiKeyService.createKey(
      tenantId,
      name,
      environment || "live",
      permissions || ["messages:read"],
    );
  }

  @Get()
  @Authorize({ resource: "apiKey", action: "read" })
  async list(@Req() req: any) {
    return this.apiKeyService.listKeys(req.user.tenantId);
  }

  @Post(":id/rotate")
  @Authorize({ resource: "apiKey", action: "update" })
  async rotate(@Param("id") id: string) {
    return this.apiKeyService.rotateKey(id);
  }

  @Delete(":id")
  @Authorize({ resource: "apiKey", action: "delete" })
  async revoke(@Req() req: any, @Param("id") id: string) {
    // TODO: Verify ownership of the key before revocation or rely on global guards
    return this.apiKeyService.revokeKey(id);
  }
}
