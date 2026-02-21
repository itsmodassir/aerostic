import { Injectable } from "@nestjs/common";

@Injectable()
export class ScopeEvaluatorService {
  isInScope(
    targetTenantId: string,
    allowedScope: string[],
    currentTenantId: string,
  ): boolean {
    if (!targetTenantId || targetTenantId === currentTenantId) return true;
    return allowedScope.includes(targetTenantId);
  }
}
