import { SetMetadata, CustomDecorator } from "@nestjs/common";

export const AUDIT_ACTION_KEY = "audit_action";

export interface AuditOptions {
  action: string;
  resourceType: string;
}

/**
 * Decorator to mark a route for automated audit logging.
 * Used in conjunction with AuditInterceptor.
 */
export const AuditAction = (options: AuditOptions): CustomDecorator<string> =>
  SetMetadata(AUDIT_ACTION_KEY, options);
