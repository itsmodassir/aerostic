import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PlatformRiskSnapshot } from "../../shared/database/entities/analytics/platform-risk-snapshot.entity";
import {
  TenantRiskScore,
  RiskStatus,
} from "../../shared/database/entities/analytics/tenant-risk-score.entity";
import { ResellerRiskScore } from "../../shared/database/entities/analytics/reseller_risk_score.entity";
import { ApiKey } from "@shared/database/entities/core/api-key.entity";
import { AdaptiveThresholdService } from "./adaptive-threshold.service";
import { RedisService } from "@shared/redis.service";

@Injectable()
export class RiskAggregatorService {
  private readonly logger = new Logger(RiskAggregatorService.name);

  constructor(
    @InjectRepository(PlatformRiskSnapshot)
    private platformSnapshotRepo: Repository<PlatformRiskSnapshot>,
    @InjectRepository(TenantRiskScore)
    private tenantRiskRepo: Repository<TenantRiskScore>,
    @InjectRepository(ResellerRiskScore)
    private resellerRiskRepo: Repository<ResellerRiskScore>,
    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,
    private redisService: RedisService,
    private adaptiveRL: AdaptiveThresholdService,
  ) {}

  /**
   * Aggregates risk levels every 30 seconds for real-time dashboard updates
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async aggregateRiskLevels() {
    this.logger.log("🔄 Aggregating Platform-Wide Risk Levels...");

    try {
      // 1. Calculate Platform Metrics
      const highRiskTenantsCount = await this.tenantRiskRepo.count({
        where: [
          { status: RiskStatus.HIGH_RISK },
          { status: RiskStatus.CRITICAL },
        ],
      });

      const suspendedKeysCount = await this.apiKeyRepo.count({
        where: { killSwitchActive: true },
      });

      const avgTenantRisk = await this.tenantRiskRepo.average("currentScore");
      const platformScore = Math.min(
        100,
        (Number(avgTenantRisk) || 0) * 0.5 + suspendedKeysCount * 5,
      );

      // 2. Persist Snapshot
      const snapshot = this.platformSnapshotRepo.create({
        overallScore: platformScore,
        highRiskTenants: highRiskTenantsCount,
        suspendedApiKeys: suspendedKeysCount,
        anomalyClusters: 0,
        attackIntensity: 0,
      });
      await this.platformSnapshotRepo.save(snapshot);

      // 3. Trigger RL Inference
      const rlResult = await this.adaptiveRL.runInference({
        avgRisk: Number(avgTenantRisk) || 0,
        spikeVelocity: 0,
        failureRate: 0,
        suspensionCount: suspendedKeysCount,
      });

      // 4. Publish Live Update to Redis Pub/Sub
      await this.redisService.publish("risk_platform_update", {
        overallScore: platformScore,
        highRiskTenants: highRiskTenantsCount,
        suspendedApiKeys: suspendedKeysCount,
        dynamicThreshold: rlResult.threshold,
        timestamp: new Date(),
      });

      // 5. Aggregate Reseller Risks
      const resellers = await this.resellerRiskRepo.find();
      for (const reseller of resellers) {
        const results = await this.tenantRiskRepo.query(
          `
                    SELECT AVG(trs.current_score) as avg_score, 
                           COUNT(*) FILTER (WHERE trs.status IN ('high_risk', 'critical')) as high_risk_count
                    FROM tenant_risk_scores trs
                    JOIN tenants t ON trs.tenant_id = t.id
                    WHERE t.reseller_id = $1
                `,
          [reseller.resellerId],
        );

        const stats = results[0];
        reseller.aggregatedRisk = Number(stats.avg_score) || 0;
        reseller.highRiskTenants = Number(stats.high_risk_count) || 0;
        reseller.riskLevel = this.mapScoreToStatus(reseller.aggregatedRisk);
        await this.resellerRiskRepo.save(reseller);
      }

      this.logger.log(
        `✅ Platform Risk Aggregated: Score=${platformScore.toFixed(2)}`,
      );
    } catch (err) {
      this.logger.error("Failed to aggregate platform risk levels", err.stack);
    }
  }

  async updateTenantRiskScore(tenantId: string, scoreDelta: number) {
    let tenantRisk = await this.tenantRiskRepo.findOne({ where: { tenantId } });

    if (!tenantRisk) {
      tenantRisk = this.tenantRiskRepo.create({ tenantId, currentScore: 0 });
    }

    tenantRisk.currentScore = Math.min(
      100,
      tenantRisk.currentScore + scoreDelta,
    );
    tenantRisk.status = this.mapScoreToStatus(tenantRisk.currentScore);
    tenantRisk.lastIncidentAt = new Date();

    await this.tenantRiskRepo.save(tenantRisk);

    // Publish Live Update to Redis Pub/Sub
    await this.redisService.publish("risk_tenant_update", {
      tenantId,
      riskScore: tenantRisk.currentScore,
      riskLevel: tenantRisk.status,
    });
  }

  private mapScoreToStatus(score: number): RiskStatus {
    if (score >= 80) return RiskStatus.CRITICAL;
    if (score >= 60) return RiskStatus.HIGH_RISK;
    if (score >= 30) return RiskStatus.WARNING;
    return RiskStatus.NORMAL;
  }
}
