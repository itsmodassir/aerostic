export enum SystemRole {
  SUPER_ADMIN = "super_admin",
  PLATFORM_ADMIN = "platform_admin",
  RESELLER_ADMIN = "reseller_admin",
  TENANT_ADMIN = "tenant_admin",
  AGENT = "agent",
}

export const ROLE_HIERARCHY: Record<string, number> = {
  [SystemRole.SUPER_ADMIN]: 100,
  [SystemRole.PLATFORM_ADMIN]: 80,
  [SystemRole.RESELLER_ADMIN]: 60,
  [SystemRole.TENANT_ADMIN]: 40,
  [SystemRole.AGENT]: 20,
};

export interface JwtPayload {
  sub: string; // userId
  id: string; // Alias for sub for consistency
  email: string;
  role: SystemRole;
  tenantId?: string;
  permissions?: string[];
  sessionId: string; // Pointer to UserSession entry
  tokenVersion: number;
  isImpersonation?: boolean;
  impersonatedBy?: string;
  iat?: number;
  exp?: number;
}
