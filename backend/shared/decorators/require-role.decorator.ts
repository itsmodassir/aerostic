import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { SystemRole } from "../types/roles";
import { JwtAuthGuard } from "../../api-service/auth/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { AdminGuard } from "../guards/admin.guard";
import { SuperAdminGuard } from "../guards/super-admin.guard";

/**
 * Decorator to enforce a minimum role requirement for a route.
 * Automatically applies JwtAuthGuard and RolesGuard.
 */
export const RequireRole = (...roles: SystemRole[]) => {
  return applyDecorators(
    SetMetadata("requiredRoles", roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
};

/**
 * Specialized decorators for cleaner usage.
 */
export const SuperAdminOnly = () => {
  return applyDecorators(UseGuards(SuperAdminGuard));
};
export const PlatformAdminOnly = () => {
  return applyDecorators(
    SetMetadata("requiredRoles", [SystemRole.PLATFORM_ADMIN]),
    UseGuards(AdminGuard, RolesGuard),
  );
};
export const ResellerAdminOnly = () => RequireRole(SystemRole.RESELLER_ADMIN);
export const TenantAdminOnly = () => RequireRole(SystemRole.TENANT_ADMIN);
export const AgentOnly = () => RequireRole(SystemRole.AGENT);
