import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";
import { RequireRole } from "@shared/decorators/require-role.decorator";
import { SystemRole } from "@shared/types/roles";

@Controller("admin/audit")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @RequireRole(SystemRole.PLATFORM_ADMIN, SystemRole.SUPER_ADMIN)
  async getLogs(
    @Query("tenantId") tenantId: string,
    @Query("actorId") actorId: string,
    @Query("action") action: string,
    @Query("from") from: string,
    @Query("to") to: string,
  ) {
    // Basic search implementation
    // In production, this would use TypeORM find with filtered conditions
    return {
      message: "Forensic logs retrieval endpoint",
      query: { tenantId, actorId, action, from, to },
      note: "Partitioned search by month is recommended for scale.",
    };
  }

  @Post("verify")
  @RequireRole(SystemRole.SUPER_ADMIN)
  async verifyIntegrity() {
    const result = await this.auditService.verifyChain();
    if (!result.isValid) {
      return {
        status: "TAMPER_DETECTED",
        corruptedId: result.corruptedId,
        severity: "CRITICAL",
      };
    }
    return { status: "INTEGRITY_VERIFIED", timestamp: new Date() };
  }
}
