import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import { ApiKey } from "@shared/database/entities/core/api-key.entity";
import {
  ApiKeyRiskEvent,
  RiskType,
  RiskSeverity,
} from "../../api-service/billing/entities/api-key-risk-event.entity";
import { RedisService } from "@shared/redis.service";
import { KafkaService } from "@shared/kafka.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AdaptiveThresholdService } from "./adaptive-threshold.service";
import { SuspensionPolicyService } from "./suspension-policy.service";
import { NotificationService } from "@shared/notification.service";

@Injectable()
export class KillSwitchService {
  private readonly logger = new Logger(KillSwitchService.name);
  private readonly TENANT_FREEZE_THRESHOLD = 120;

  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,
    @InjectRepository(ApiKeyRiskEvent)
    private riskEventRepo: Repository<ApiKeyRiskEvent>,
    private redisService: RedisService,
    private kafkaService: KafkaService,
    private adaptiveRL: AdaptiveThresholdService,
    private policyEngine: SuspensionPolicyService,
    private notificationService: NotificationService,
  ) {}

  /**
   * ASA Decay Engine: Reduces risk scores by 10% every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async decayRiskScores() {
    this.logger.log("Running ASA Risk Decay Engine (10% decay)...");

    // score = score * 0.9
    await this.apiKeyRepo
      .createQueryBuilder()
      .update(ApiKey)
      .set({
        riskScore: () => "risk_score * 0.9",
      })
      .where("risk_score > 0")
      .execute();

    // Auto-Recovery: Restore if risk < 40 for 30 mins
    // For simplicity, we check if score is < 40 and was active
    const recoverables = await this.apiKeyRepo.find({
      where: { killSwitchActive: true, riskScore: MoreThan(-1) },
    });

    for (const key of recoverables) {
      if (Number(key.riskScore) < 40) {
        await this.restoreApiKey(key, "Auto-recovery: Risk normalized");
      }
    }
  }

  async addRiskSignal(
    apiKeyId: string,
    tenantId: string,
    type: RiskType,
    scoreOverride?: number,
    metadata?: any,
  ) {
    const score = scoreOverride || this.policyEngine.getWeightForSignal(type);

    // 1. Log the event
    const event = this.riskEventRepo.create({
      apiKeyId,
      tenantId,
      riskType: type,
      severity: this.mapScoreToSeverity(score),
      score,
      metadata,
    });
    await this.riskEventRepo.save(event);

    // 2. Update ApiKey risk score
    const apiKey = await this.apiKeyRepo.findOne({ where: { id: apiKeyId } });
    if (!apiKey) return;

    apiKey.riskScore = Number(apiKey.riskScore) + score;
    apiKey.lastRiskEvent = new Date();

    // 3. Evalutate ASA Policy
    // Fetch recent active signals for multi-signal check
    const recentEvents = await this.riskEventRepo.find({
      where: { apiKeyId, createdAt: MoreThan(new Date(Date.now() - 300000)) }, // Last 5 mins
    });
    const categories = new Set(recentEvents.map((e) => e.riskType));

    const policy = this.policyEngine.evaluate(apiKey.riskScore, categories);

    if (policy.shouldSuspend && !apiKey.killSwitchActive) {
      await this.activateKillSwitch(apiKey, policy.reason);
    } else if (policy.shouldWarn) {
      this.logger.warn(
        `⚠️ API Key ${apiKeyId} in WARNING mode: ${policy.reason}`,
      );
      // TODO: Apply 50% rate-limit multiplier in Redis
    }

    await this.apiKeyRepo.save(apiKey);

    // 4. Check for Cascading triggers (Key -> Tenant -> Reseller)
    if (apiKey.riskScore >= this.TENANT_FREEZE_THRESHOLD) {
      await this.freezeTenant(
        tenantId,
        `Cascading risk escalation from key ${apiKeyId}`,
      );
    }
  }

  private async activateKillSwitch(apiKey: ApiKey, reason: string) {
    this.logger.error(
      `🚨 KILL-SWITCH TRIGGERED: Suspending API Key ${apiKey.id} (${apiKey.name}) for tenant ${apiKey.tenantId}`,
    );

    apiKey.killSwitchActive = true;
    apiKey.killReason = reason;
    await this.apiKeyRepo.save(apiKey);

    // Fast enforcement layer (Redis)
    await this.redisService.set(`api_key_block:${apiKey.id}`, "1", 3600); // Block for 1 hour

    await this.redisService.publish("security_alerts", {
      type: "KILL_SWITCH_ACTIVATED",
      message: `API Key ${apiKey.id} suspended: ${reason}`,
      severity: "CRITICAL",
      metadata: { tenantId: apiKey.tenantId, apiKeyId: apiKey.id },
    });

    await this.notificationService.sendSecurityAlert({
      title: "KILL-SWITCH ACTIVATED",
      severity: "CRITICAL",
      message: `API Key ${apiKey.id} suspended: ${reason}`,
      tenantId: apiKey.tenantId,
      metadata: { apiKeyId: apiKey.id, reason },
    });

    await this.kafkaService.emit("aerostic.security.events", {
      action: "API_KEY_SUSPENDED",
      apiKeyId: apiKey.id,
      tenantId: apiKey.tenantId,
      reason,
      timestamp: Date.now(),
    });
  }

  private async restoreApiKey(apiKey: ApiKey, reason: string) {
    this.logger.log(`✅ API Key ${apiKey.id} restored: ${reason}`);
    apiKey.killSwitchActive = false;
    apiKey.killReason = null;
    await this.apiKeyRepo.save(apiKey);
    await this.redisService.del(`api_key_block:${apiKey.id}`);
  }

  private async freezeTenant(tenantId: string, reason: string) {
    this.logger.error(
      `🛑 TENANT FROZEN: Suspending all operations for tenant ${tenantId}`,
    );

    // Update Tenant Status in DB
    await this.apiKeyRepo.query(
      `UPDATE tenants SET status = 'suspended' WHERE id = $1`,
      [tenantId],
    );

    await this.redisService.publish("security_alerts", {
      type: "TENANT_SUSPENDED",
      message: `Tenant ${tenantId} frozen: ${reason}`,
      severity: "CRITICAL",
      metadata: { tenantId },
    });

    await this.notificationService.sendSecurityAlert({
      title: "TENANT FROZEN",
      severity: "CRITICAL",
      message: `Tenant ${tenantId} frozen: ${reason}`,
      tenantId,
      metadata: { reason },
    });

    // Kafka Event for downstream services (Webhook, Campaign)
    await this.kafkaService.emit("aerostic.security.events", {
      action: "TENANT_SUSPENDED",
      tenantId,
      reason,
      timestamp: Date.now(),
    });
  }

  private mapScoreToSeverity(score: number): RiskSeverity {
    if (score >= 50) return RiskSeverity.CRITICAL;
    if (score >= 30) return RiskSeverity.HIGH;
    if (score >= 15) return RiskSeverity.MEDIUM;
    return RiskSeverity.LOW;
  }
}
