import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { RedisService } from "@shared/redis.service";
import { Request } from "express";

@Injectable()
export class ApiKeyEnforcementGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyEnforcementGuard.name);

  constructor(private redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKeyRaw = request.headers["x-api-key"] as string;

    if (!apiKeyRaw) return true; // Let the AuthGuard handle missing keys

    // 1. Fast Layer: Check Redis Blocklist
    // We need to derive the ID from the key or have it available.
    // Ideally, the AuthGuard already populated the API Key ID in the request.
    // If not, we check by a hash of the key prefix for performance.

    // For now, assume the key ID is passed in headers or extracted.
    // Let's use a simpler approach: check if any blocked key matches the current context.

    const keyId = (request as any).apiKey?.id;
    if (keyId) {
      const isBlocked = await this.redisService.get(`api_key_block:${keyId}`);
      if (isBlocked) {
        this.logger.warn(`Blocked request from suspended API Key: ${keyId}`);
        throw new ForbiddenException(
          "API Key has been suspended due to security anomalies.",
        );
      }
    }

    return true;
  }
}
