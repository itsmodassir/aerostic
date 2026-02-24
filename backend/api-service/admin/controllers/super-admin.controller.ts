import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
  Res,
  BadRequestException,
} from "@nestjs/common";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { SuperAdminOnly } from "@shared/decorators/require-role.decorator";
import { AdminConfigService } from "../services/admin-config.service";
import { AdminDatabaseService } from "../services/admin-database.service";
import { AdminTenantService } from "../services/admin-tenant.service";
import { AdminService } from "../admin.service";
import { AuthService } from "../../auth/auth.service";
import { AuditService } from "../../audit/audit.service";

@Controller("admin/system")
@SuperAdminOnly()
export class SuperAdminController {
  constructor(
    private readonly configService: AdminConfigService,
    private readonly databaseService: AdminDatabaseService,
    private readonly tenantService: AdminTenantService,
    private readonly legacyAdminService: AdminService,
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) { }

  // ============ Database Explorer ============
  @Get("database/tables")
  async getTables() {
    return this.databaseService.getTables();
  }

  @Get("database/tables/:tableName")
  async getTableData(
    @Param("tableName") tableName: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 50,
  ) {
    return this.databaseService.getTableData(tableName, page, limit);
  }

  // ============ System Configuration ============
  @Get("config")
  async getConfig() {
    return this.configService.getConfig();
  }

  @Post("config")
  async updateConfig(@Body() updates: any, @Req() req: any) {
    // Audit log should happen inside service
    return this.configService.setConfig(updates, req.user?.id);
  }

  @Delete("config/:key")
  async deleteConfig(@Param("key") key: string) {
    await this.configService.deleteConfig(key);
    return { success: true };
  }

  @Get("env")
  async getEnv() {
    return this.configService.getEnv();
  }

  // ============ System Operations ============
  @Post("tokens/rotate")
  async rotateSystemTokens() {
    return this.legacyAdminService.rotateSystemTokens();
  }

  // ============ Nuclear: Impersonation ============
  @Post("impersonate/:tenantId")
  async impersonateTenant(
    @Param("tenantId") tenantId: string,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const adminUser = req.user;
    const targetUser = await this.tenantService.getTenantOwner(tenantId);

    if (!targetUser) {
      throw new BadRequestException("Target tenant owner not found");
    }

    // Generate token with impersonation flags
    const { access_token, refresh_token } = await this.authService.login(
      targetUser,
      req,
      {
        impersonatedBy: adminUser.id,
        isImpersonation: true,
        tenantId: tenantId,
      },
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      domain: isProduction ? ".aimstore.in" : undefined,
      path: "/",
      maxAge: 1 * 60 * 60 * 1000, // 1 hour for impersonation access tokens
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      domain: isProduction ? ".aimstore.in" : undefined,
      path: "/",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours for impersonation refresh window
    });

    await this.auditService.logAction(
      "super_admin",
      adminUser.id,
      "IMPERSONATION_START",
      `Impersonated tenant owner ${targetUser.email} for tenant ${tenantId}`,
      tenantId,
    );

    return {
      success: true,
      workspaceId: tenantId,
      redirectUrl: `/dashboard/${tenantId}`,
    };
  }
}
