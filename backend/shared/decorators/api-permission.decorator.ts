import { SetMetadata, CustomDecorator } from "@nestjs/common";

export const API_PERMISSION_KEY = "api_permissions";

/**
 * Decorator to require specific permissions for an API key.
 * Used in conjunction with ApiKeyGuard.
 */
export const RequireApiPermission = (
  ...permissions: string[]
): CustomDecorator<string> => SetMetadata(API_PERMISSION_KEY, permissions);
