import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Reflector } from "@nestjs/core";
import { AuditService } from "./audit.service";
import {
  AUDIT_ACTION_KEY,
  AuditOptions,
} from "./decorators/audit-action.decorator";
import { PiiMasker } from "@shared/utils/pii-masker.util";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private auditService: AuditService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditOptions>(
      "audit_action",
      context.getHandler(),
    );

    if (!auditOptions) return next.handle();

    const request = context.switchToHttp().getRequest();
    const { user, api_key } = request;
    const startTime = Date.now();

    // Capture environment and mask PII in metadata
    const maskedRequestData = PiiMasker.mask({
      body: request.body,
      query: request.query,
      params: request.params,
    });

    return next.handle().pipe(
      tap(() => {
        const actorType = request.isApiKeyAuth
          ? "api_key"
          : user
            ? "user"
            : "system";
        const actorId = request.isApiKeyAuth ? request.apiKey?.id : user?.id;

        this.auditService
          .log({
            actorType,
            actorId,
            action: auditOptions.action,
            resourceType: auditOptions.resourceType,
            resourceId: request.params.id || request.body.id,
            tenantId: request.tenantId || user?.tenantId,
            ipAddress: request.ip || request.connection.remoteAddress,
            userAgent: request.headers["user-agent"] || "unknown",
            metadata: {
              method: request.method,
              path: request.url,
              durationMs: Date.now() - startTime,
              statusCode: context.switchToHttp().getResponse().statusCode,
              ...maskedRequestData,
            },
          })
          .catch((err) => console.error("Failed to log audit event", err));
      }),
    );
  }
}
