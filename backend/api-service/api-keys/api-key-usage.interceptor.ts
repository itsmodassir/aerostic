import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApiKeyUsage } from "../../shared/database/entities/analytics/api-key-usage.entity";

@Injectable()
export class ApiKeyUsageInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(ApiKeyUsage)
    private usageRepo: Repository<ApiKeyUsage>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        if (request.isApiKeyAuth && request.apiKey) {
          const responseTime = Date.now() - startTime;
          const { method, url, ip, apiKey } = request;

          this.usageRepo
            .save({
              apiKeyId: apiKey.id,
              endpoint: url,
              method,
              ipAddress: ip,
              statusCode: context.switchToHttp().getResponse().statusCode,
              responseTimeMs: responseTime,
            })
            .catch((err) => console.error("Failed to log API key usage", err));
        }
      }),
    );
  }
}
