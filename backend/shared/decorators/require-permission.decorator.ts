import { SetMetadata } from "@nestjs/common";

/**
 * Decorator to require a specific permission scope for an API Key.
 * Should be used in conjunction with ApiKeyGuard.
 */
export const RequireApiPermission = (permission: string) =>
  SetMetadata("requiredApiPermission", permission);
