import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import { PlatformRiskSnapshot } from "@shared/database/entities/analytics/platform-risk-snapshot.entity";
import { TenantRiskScore } from "@shared/database/entities/analytics/tenant-risk-score.entity";
import { ApiKeyRiskEvent } from "../../billing/entities/api-key-risk-event.entity";
import { PlatformAnomalyCluster } from "@shared/database/entities/analytics/platform-anomaly-cluster.entity";
import { ApiKey } from "@shared/database/entities/core/api-key.entity";

@Injectable()
export class AdminRiskService {
  private readonly logger = new Logger(AdminRiskService.name);

  constructor(
    @InjectRepository(PlatformRiskSnapshot)
    private platformSnapshotRepo: Repository<PlatformRiskSnapshot>,
    @InjectRepository(TenantRiskScore)
    private tenantRiskRepo: Repository<TenantRiskScore>,
    @InjectRepository(ApiKeyRiskEvent)
    private riskEventRepo: Repository<ApiKeyRiskEvent>,
    @InjectRepository(PlatformAnomalyCluster)
    private clusterRepo: Repository<PlatformAnomalyCluster>,
    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,
  ) {}

  async getPlatformOverview() {
    const latest = await this.platformSnapshotRepo.findOne({
      order: { createdAt: "DESC" },
    });

    const previous = await this.platformSnapshotRepo.findOne({
      where: { createdAt: MoreThan(new Date(Date.now() - 3600000)) }, // 1h ago
      order: { createdAt: "ASC" },
    });

    return {
      current: latest || {
        overallScore: 0,
        highRiskTenants: 0,
        suspendedApiKeys: 0,
      },
      trend:
        latest && previous ? latest.overallScore - previous.overallScore : 0,
    };
  }

  async getHighRiskTenants(limit = 10) {
    return this.tenantRiskRepo.find({
      relations: ["tenant"],
      order: { currentScore: "DESC" },
      take: limit,
    });
  }

  async getRecentSecurityEvents(limit = 50) {
    return this.riskEventRepo.find({
      relations: ["apiKey", "apiKey.tenant"],
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async getActiveClusters() {
    return this.clusterRepo.find({
      order: { createdAt: "DESC" },
      take: 10,
    });
  }

  async getClusterHeatmap(hours = 24) {
    const results = await this.clusterRepo.query(
      `
            SELECT 
                cluster_signature as signature,
                DATE_TRUNC('hour', created_at) as hour,
                AVG(affected_tenants) as intensity,
                MAX(risk_level)::text as risk
            FROM platform_anomaly_clusters
            WHERE created_at > NOW() - INTERVAL '1 hour' * $1
            GROUP BY signature, hour
            ORDER BY hour ASC, intensity DESC
        `,
      [hours],
    );

    return results.map((r: any) => ({
      signature: r.signature,
      hour: r.hour,
      intensity: parseFloat(r.intensity),
      risk: r.risk,
    }));
  }

  async getHistoricalTrends(hours = 24) {
    return this.platformSnapshotRepo.find({
      where: { createdAt: MoreThan(new Date(Date.now() - hours * 3600000)) },
      order: { createdAt: "ASC" },
    });
  }

  async overrideRiskScore(tenantId: string, newScore: number, reason: string) {
    this.logger.log(
      `Admin override for tenant ${tenantId}: score=${newScore}, reason=${reason}`,
    );

    await this.tenantRiskRepo.update(
      { tenantId },
      {
        currentScore: newScore,
        lastIncidentAt: new Date(),
      },
    );

    return { success: true };
  }
}
