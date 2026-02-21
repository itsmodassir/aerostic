import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApiKey } from "../../shared/database/entities/core/api-key.entity";
import { RedisService } from "@shared/redis.service";
import { AuditService } from "../audit/audit.service";
import * as crypto from "crypto";

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);
  private readonly CACHE_PREFIX = "api_key:";

  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,
    private redisService: RedisService,
    private auditService: AuditService,
  ) {}

  async createKey(
    tenantId: string,
    name: string,
    environment: "live" | "test" = "live",
    permissions: string[] = ["messages:read"],
  ): Promise<{ rawKey: string; apiKey: ApiKey }> {
    const randomPart = crypto.randomBytes(32).toString("base64url");
    const prefix = `ask_${environment}_${randomPart.substring(0, 8)}`;
    const fullKey = `ask_${environment}_${randomPart}`;
    const keyHash = this.hashKey(fullKey);

    const apiKey = this.apiKeyRepo.create({
      tenantId,
      name,
      keyPrefix: prefix,
      keyHash,
      environment,
      permissions,
      isActive: true,
    });

    await this.apiKeyRepo.save(apiKey);

    return { rawKey: fullKey, apiKey };
  }

  async validateKey(rawKey: string): Promise<ApiKey> {
    const segments = rawKey.split("_");
    if (segments.length < 3 || segments[0] !== "ask") {
      throw new UnauthorizedException("Invalid API key format");
    }

    const environment = segments[1];
    const prefix = rawKey.substring(0, 17); // ask_live_xxxxxxxx
    const cacheKey = `${this.CACHE_PREFIX}${prefix}`;

    // 1. Try Cache
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      const metadata = JSON.parse(cached);
      if (this.hashKey(rawKey) === metadata.keyHash) {
        return metadata;
      }
    }

    // 2. DB Fallback
    const keyHash = this.hashKey(rawKey);
    const apiKey = await this.apiKeyRepo.findOne({
      where: { keyHash },
    });

    if (!apiKey) {
      throw new UnauthorizedException("Invalid API key");
    }

    if (!apiKey.isActive) {
      throw new UnauthorizedException("API key is revoked");
    }

    if (apiKey.killSwitchActive) {
      throw new UnauthorizedException(
        `API key suspended: ${apiKey.killReason || "Security Risk Detected"}`,
      );
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new UnauthorizedException("API key has expired");
    }

    // 3. Update Cache
    await this.redisService.set(
      cacheKey,
      JSON.stringify(apiKey),
      300, // 5 minutes TTL
    );

    // 4. Update Last Used (Async, non-blocking for response)
    this.apiKeyRepo
      .update(apiKey.id, { lastUsedAt: new Date() })
      .catch((err) =>
        this.logger.error(
          `Failed to update lastUsedAt for key ${apiKey.id}`,
          err.stack,
        ),
      );

    return apiKey;
  }

  async flagAnomaly(apiKeyId: string, reason: string): Promise<void> {
    this.logger.warn(`Anomaly flagged for API Key ${apiKeyId}: ${reason}`);

    const key = await this.apiKeyRepo.findOne({ where: { id: apiKeyId } });
    if (!key) return;

    // Log to Audit System
    await this.auditService.log({
      actorType: "api_key",
      actorId: apiKeyId,
      action: "API_KEY_ANOMALY",
      resourceType: "api_key",
      resourceId: apiKeyId,
      tenantId: key.tenantId,
      ipAddress: "0.0.0.0", // Will be enriched by guard if possible
      userAgent: "system-security",
      metadata: {
        reason,
        riskScore: key.riskScore,
      },
    });

    // Trigger Kill Switch if risk is too high (logic can be expanded)
    if (Number(key.riskScore) >= 90) {
      await this.apiKeyRepo.update(apiKeyId, {
        killSwitchActive: true,
        killReason: `Automated suspension: ${reason}`,
        lastRiskEvent: new Date(),
      });
      await this.redisService.del(`${this.CACHE_PREFIX}${key.keyPrefix}`);
    }
  }

  async revokeKey(id: string): Promise<void> {
    const key = await this.apiKeyRepo.findOne({ where: { id } });
    if (key) {
      await this.apiKeyRepo.update(id, { isActive: false });
      await this.redisService.del(`${this.CACHE_PREFIX}${key.keyPrefix}`);
    }
  }

  async listKeys(tenantId: string): Promise<ApiKey[]> {
    return this.apiKeyRepo.find({
      where: { tenantId, isActive: true },
      order: { createdAt: "DESC" },
    });
  }

  async rotateKey(id: string): Promise<{ rawKey: string; apiKey: ApiKey }> {
    const oldKey = await this.apiKeyRepo.findOne({ where: { id } });
    if (!oldKey || !oldKey.isActive) {
      throw new UnauthorizedException("Invalid or inactive key");
    }

    // 1. Create new key with same permissions/env
    const result = await this.createKey(
      oldKey.tenantId,
      `${oldKey.name} (Rotated)`,
      oldKey.environment,
      oldKey.permissions,
    );

    // 2. Mark old key as expiring in 24 hours
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    await this.apiKeyRepo.update(id, { expiresAt: expiry });

    // 3. Clear cache to force reload with expiry
    await this.redisService.del(`${this.CACHE_PREFIX}${oldKey.keyPrefix}`);

    return result;
  }

  private hashKey(key: string): string {
    return crypto.createHash("sha256").update(key).digest("hex");
  }
}
