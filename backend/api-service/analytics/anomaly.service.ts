import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AnomalyEvent } from "../../shared/database/entities/analytics/anomaly-event.entity";
import {
  TenantRiskScore,
  RiskStatus,
} from "../../shared/database/entities/analytics/tenant-risk-score.entity";
import { TenantBehaviorProfile } from "../../shared/database/entities/analytics/behavior-profile.entity";
import { AuditLog } from "../../shared/database/entities/core/audit-log.entity";
import { NotificationService } from "@shared/notification.service";

@Injectable()
export class AnomalyService {
  private readonly logger = new Logger(AnomalyService.name);

  constructor(
    @InjectRepository(AnomalyEvent)
    private anomalyRepo: Repository<AnomalyEvent>,
    @InjectRepository(TenantRiskScore)
    private riskRepo: Repository<TenantRiskScore>,
    @InjectRepository(TenantBehaviorProfile)
    private profileRepo: Repository<TenantBehaviorProfile>,
    private notificationService: NotificationService,
  ) {}

  /**
   * Evaluates an audit log for potential anomalies
   */
  async evaluateAuditLog(log: AuditLog) {
    // 1. Check for heuristic security anomalies (Sequence-based)
    if (log.action === "ROLE_ESCALATION") {
      await this.recordAnomaly(log.tenantId, "ROLE_ESCALATION_DETECTED", 40, {
        actorId: log.actorId,
        details: log.metadata,
      });
    }

    if (log.action === "MASSIVE_DELETE") {
      await this.recordAnomaly(log.tenantId, "DATA_LOSS_RISK", 50, {
        resourceType: log.resourceType,
        details: log.metadata,
      });
    }

    // 2. Check for Geographic anomalies
    await this.checkGeoAnomaly(log);
  }

  /**
   * Checks if the login/request comes from an unusual country
   */
  private async checkGeoAnomaly(log: AuditLog) {
    const profile = await this.profileRepo.findOne({
      where: { tenantId: log.tenantId },
    });
    if (!profile || !profile.usualCountries.length) return;

    // This would ideally use a GeoIP service to get country from log.ipAddress
    // For now, we assume metadata contains country if available from interceptor
    const country = log.metadata?.country;
    if (country && !profile.usualCountries.includes(country)) {
      await this.recordAnomaly(log.tenantId, "GEO_IP_DEVIATION", 25, {
        detectedCountry: country,
        allowedCountries: profile.usualCountries,
        ip: log.ipAddress,
      });
    }
  }

  /**
   * Statistical Anomaly Detection (Z-Score)
   * Call this when message/API counts are aggregated (hourly/daily)
   */
  async checkStatisticalAnomaly(
    tenantId: string,
    type: "messages" | "api",
    currentCount: number,
  ) {
    const profile = await this.profileRepo.findOne({ where: { tenantId } });
    if (!profile) return;

    const mean =
      type === "messages"
        ? profile.avgMessagesPerDay
        : profile.avgApiCallsPerHour;
    const stdDev =
      type === "messages"
        ? profile.stdMessagesPerDay
        : profile.stdApiCallsPerHour;

    if (stdDev === 0) return;

    const zScore = Math.abs((currentCount - mean) / stdDev);

    if (zScore > 3) {
      await this.recordAnomaly(
        tenantId,
        `${type.toUpperCase()}_SPIKE`,
        Math.min(Math.floor(zScore * 5), 50),
        {
          currentCount,
          mean,
          stdDev,
          zScore,
        },
      );
    }
  }

  /**
   * Flags an unauthorized permission attempt
   */
  async flagPermissionViolation(
    tenantId: string,
    actorId: string,
    actorType: "user" | "api_key" | "system",
    requiredPermission: string,
  ) {
    await this.recordAnomaly(tenantId, "PERMISSION_VIOLATION", 15, {
      actorId,
      actorType,
      requiredPermission,
      timestamp: new Date(),
    });
  }

  /**
   * Records an anomaly and updates the tenant risk score
   */
  private async recordAnomaly(
    tenantId: string,
    type: string,
    scoreInfluence: number,
    details: any,
  ) {
    this.logger.warn(
      `Anomaly detected for tenant ${tenantId}: ${type} (+${scoreInfluence} risk)`,
    );

    // Record the event
    await this.anomalyRepo.save({
      tenantId,
      eventType: type,
      riskScoreContribution: scoreInfluence,
      details,
    });

    // Update aggregate risk score
    let risk = await this.riskRepo.findOne({ where: { tenantId } });
    if (!risk) {
      risk = this.riskRepo.create({ tenantId, currentScore: 0 });
    }

    risk.currentScore += scoreInfluence;
    risk.lastIncidentAt = new Date();

    // Update Status
    if (risk.currentScore >= 100) risk.status = RiskStatus.CRITICAL;
    else if (risk.currentScore >= 75) risk.status = RiskStatus.HIGH_RISK;
    else if (risk.currentScore >= 50) risk.status = RiskStatus.WARNING;
    else risk.status = RiskStatus.NORMAL;

    await this.riskRepo.save(risk);

    // Trigger Auto-Response
    await this.triggerAutoResponse(risk);
  }

  private async triggerAutoResponse(risk: TenantRiskScore) {
    if (risk.status === RiskStatus.CRITICAL) {
      this.logger.error(
        `CRITICAL RISK for tenant ${risk.tenantId}. Initiating account lock.`,
      );

      await this.notificationService.sendSecurityAlert({
        title: "CRITICAL Tenant Risk Detected",
        severity: "CRITICAL",
        message: `Tenant ${risk.tenantId} has reached a CRITICAL risk score of ${risk.currentScore}. Account suspension recommended.`,
        tenantId: risk.tenantId,
        metadata: { currentScore: risk.currentScore },
      });

      // Production: Call TenantService.suspend(risk.tenantId, 'ANOMALY_DETECTED')
    } else if (risk.status === RiskStatus.HIGH_RISK) {
      this.logger.warn(
        `HIGH RISK for tenant ${risk.tenantId}. Rate limiting initiated.`,
      );

      await this.notificationService.sendSecurityAlert({
        title: "HIGH Tenant Risk Detected",
        severity: "HIGH",
        message: `Tenant ${risk.tenantId} has a high risk score of ${risk.currentScore}. Monitoring increased.`,
        tenantId: risk.tenantId,
        metadata: { currentScore: risk.currentScore },
      });

      // Production: Call RedisService to set aggressive rate limits
    }
  }
}
