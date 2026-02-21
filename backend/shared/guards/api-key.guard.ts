import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { ApiKeyService } from "../../api-service/api-keys/api-keys.service";
import { RedisService } from "@shared/redis.service";
import { Reflector } from "@nestjs/core";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private redisService: RedisService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Extract and Validate Key
    const rawKey = this.extractBearer(request);
    const apiKey = await this.apiKeyService.validateKey(rawKey);

    // 2. IP Whitelisting (Proxy-Safe)
    if (apiKey.allowedIps && apiKey.allowedIps.length > 0) {
      const clientIp = this.extractClientIp(request);
      if (!apiKey.allowedIps.includes(clientIp)) {
        throw new ForbiddenException("IP Address not allowed");
      }
    }

    // 3. Permission Check (Route-level)
    const requiredPermission = this.reflector.get<string>(
      "requiredApiPermission",
      context.getHandler(),
    );

    if (
      requiredPermission &&
      (!apiKey.permissions || !apiKey.permissions.includes(requiredPermission))
    ) {
      throw new ForbiddenException(
        `Insufficient API permissions: required ${requiredPermission}`,
      );
    }

    // 4. Rate Limiting (Per-Key)
    await this.checkRateLimit(apiKey);

    // 5. Attach Context to Request
    request.tenantId = apiKey.tenantId;
    request.apiKey = apiKey;
    request.isApiKeyAuth = true;

    return true;
  }

  private extractBearer(request: any): string {
    const authHeader = request.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Missing or invalid Authorization header",
      );
    }
    return authHeader.split(" ")[1];
  }

  private extractClientIp(request: any): string {
    const xff = request.headers["x-forwarded-for"];
    if (xff) {
      return xff.split(",")[0].trim();
    }
    return request.ip || request.socket?.remoteAddress;
  }

  private async checkRateLimit(apiKey: any): Promise<void> {
    const minuteKey = `rate:api:${apiKey.id}:min`;
    const dayKey = `rate:api:${apiKey.id}:day`;

    const [minCount, dayCount] = await Promise.all([
      this.redisService.incr(minuteKey),
      this.redisService.incr(dayKey),
    ]);

    // Set expiration on first hit
    if (minCount === 1) await this.redisService.expire(minuteKey, 60);
    if (dayCount === 1) await this.redisService.expire(dayKey, 86400);

    // Dynamic Throttling based on Risk Score
    const effectiveLimit =
      Number(apiKey.riskScore) >= 70
        ? Math.floor(apiKey.rateLimitPerMinute * 0.3)
        : Number(apiKey.riskScore) >= 50
          ? Math.floor(apiKey.rateLimitPerMinute * 0.5)
          : apiKey.rateLimitPerMinute;

    if (minCount > effectiveLimit) {
      await this.apiKeyService.flagAnomaly(apiKey.id, "rate_limit_spike");
      throw new ForbiddenException("Rate limit exceeded (Minute)");
    }

    if (dayCount > (apiKey.rateLimitPerDay || 100000)) {
      await this.apiKeyService.flagAnomaly(apiKey.id, "daily_quota_exhausted");
      throw new ForbiddenException("Daily quota exceeded");
    }
  }
}
