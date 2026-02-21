import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AUTHORIZE_KEY } from "../decorators/authorize.decorator";
import { AuthorizeMetadata } from "../interfaces/authorization-context.interface";
import { PolicyEngineService } from "../engine/policy-engine.service";

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(
    private reflector: Reflector,
    private policyEngine: PolicyEngineService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<AuthorizeMetadata>(
      AUTHORIZE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata) return true;

    const request = context.switchToHttp().getRequest();
    const tenantId =
      request.headers["x-tenant-id"] ||
      request.query.tenantId ||
      request.body?.tenantId;

    if (!tenantId) {
      throw new ForbiddenException("Tenant context required");
    }

    const decision = await this.policyEngine.evaluate({
      user: request.user,
      apiKey: request.apiKey,
      tenantId,
      resource: metadata.resource,
      action: metadata.action,
    });

    if (!decision.allowed) {
      this.logger.warn(
        `AuthZ Denied: ${request.user?.sub || request.apiKey?.id} - ${metadata.resource}:${metadata.action} - ${decision.reason}`,
      );
      throw new ForbiddenException(decision.reason || "Access denied");
    }

    return true;
  }
}
