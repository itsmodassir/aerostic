import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TenantHourlyMetric } from "../../shared/database/entities/analytics/tenant-hourly-metric.entity";
import {
  PlatformAnomalyCluster,
  ClusterRiskLevel,
} from "../../shared/database/entities/analytics/platform-anomaly-cluster.entity";

@Injectable()
export class GlobalAnomalyService {
  private readonly logger = new Logger(GlobalAnomalyService.name);

  constructor(
    @InjectRepository(TenantHourlyMetric)
    private metricRepo: Repository<TenantHourlyMetric>,
    @InjectRepository(PlatformAnomalyCluster)
    private clusterRepo: Repository<PlatformAnomalyCluster>,
    private dataSource: DataSource,
  ) {}

  /**
   * Aggregates usage events into hourly buckets for all tenants.
   * Runs at 5 minutes past every hour for the previous hour.
   */
  @Cron("5 * * * *")
  async aggregateHourlyMetrics(targetHour?: Date) {
    const hourBucket = targetHour || new Date();
    hourBucket.setSeconds(0, 0);
    hourBucket.setMinutes(0);
    if (!targetHour) hourBucket.setHours(hourBucket.getHours() - 1);

    const start = hourBucket;
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const stats = await this.dataSource.query(
      `
      SELECT 
        tenant_id as "tenantId",
        COUNT(*) FILTER (WHERE metric = 'messages_sent') as "messagesSent",
        COUNT(*) FILTER (WHERE metric = 'messages_failed') as "messagesFailed",
        COUNT(*) FILTER (WHERE metric = 'api_call') as "apiCalls",
        COUNT(DISTINCT metadata->>'ip') as "distinctIps"
      FROM usage_events
      WHERE created_at >= $1 AND created_at < $2
      GROUP BY tenant_id
    `,
      [start, end],
    );

    for (const row of stats) {
      const messagesSent = parseInt(row.messagesSent);
      const messagesFailed = parseInt(row.messagesFailed);
      const failedRatio =
        messagesSent > 0 ? (messagesFailed / messagesSent) * 100 : 0;

      await this.metricRepo.upsert(
        {
          tenantId: row.tenantId,
          hourBucket: start,
          messagesSent,
          messagesFailed,
          apiCalls: parseInt(row.apiCalls),
          distinctIps: parseInt(row.distinctIps),
          failedRatio,
        },
        ["tenantId", "hourBucket"],
      );
    }

    this.logger.log(
      `Aggregated hourly metrics for ${stats.length} tenants for bucket ${start.toISOString()}`,
    );
  }

  /**
   * Detects clusters of suspicious behavior across multiple tenants.
   * Runs at 10 minutes past every hour.
   */
  @Cron("10 * * * *")
  async detectClusters() {
    const baseline = await this.computeGlobalBaseline();
    const lastHour = new Date();
    lastHour.setMinutes(0, 0, 0);
    lastHour.setHours(lastHour.getHours() - 1);

    const suspiciousTenants = await this.metricRepo
      .createQueryBuilder("metric")
      .where("metric.hourBucket = :lastHour", { lastHour })
      .andWhere(
        "(metric.messagesSent > :msgThreshold OR metric.failedRatio > :failThreshold)",
        {
          msgThreshold: baseline.avgMessages * 3,
          failThreshold: baseline.avgFailedRatio * 2,
        },
      )
      .getMany();

    if (suspiciousTenants.length < 5) return;

    const clusters = this.clusterBySimilarity(suspiciousTenants);

    for (const cluster of clusters) {
      if (cluster.tenants.length >= 5) {
        await this.clusterRepo.save({
          clusterSignature: cluster.signature,
          affectedTenantCount: cluster.tenants.length,
          riskLevel: cluster.riskLevel,
          metadata: {
            tenantIds: cluster.tenants.map(
              (t: TenantHourlyMetric) => t.tenantId,
            ),
            metrics: cluster.avgMetrics,
          },
        });
      }
    }
  }

  async computeGlobalBaseline() {
    const lastHour = new Date();
    lastHour.setMinutes(0, 0, 0);
    lastHour.setHours(lastHour.getHours() - 1);

    const result = await this.metricRepo
      .createQueryBuilder("metric")
      .select("AVG(metric.messagesSent)", "avgMessages")
      .addSelect("AVG(metric.failedRatio)", "avgFailedRatio")
      .where("metric.hourBucket = :lastHour", { lastHour })
      .getRawOne();

    return {
      avgMessages: parseFloat(result?.avgMessages || "0"),
      avgFailedRatio: parseFloat(result?.avgFailedRatio || "0"),
    };
  }

  private clusterBySimilarity(tenants: TenantHourlyMetric[]) {
    const clusters: any[] = [];
    const processed = new Set<string>();

    for (const tenant of tenants) {
      if (processed.has(tenant.id)) continue;

      const currentCluster = [tenant];
      processed.add(tenant.id);
      const vectorA = [
        tenant.messagesSent,
        tenant.failedRatio,
        tenant.apiCalls,
      ];

      for (const other of tenants) {
        if (processed.has(other.id)) continue;
        const vectorB = [other.messagesSent, other.failedRatio, other.apiCalls];
        if (this.cosineSimilarity(vectorA, vectorB) > 0.9) {
          currentCluster.push(other);
          processed.add(other.id);
        }
      }

      if (currentCluster.length >= 5) {
        clusters.push({
          signature: `pattern_${(tenant as any).id.substring(0, 8)}`,
          tenants: currentCluster,
          riskLevel:
            currentCluster.length > 15
              ? ClusterRiskLevel.CRITICAL
              : ClusterRiskLevel.HIGH,
          avgMetrics: {
            avgMessages:
              currentCluster.reduce(
                (s, t: TenantHourlyMetric) => s + t.messagesSent,
                0,
              ) / currentCluster.length,
            avgFailedRatio:
              currentCluster.reduce(
                (s, t: TenantHourlyMetric) => s + t.failedRatio,
                0,
              ) / currentCluster.length,
          },
        });
      }
    }
    return clusters;
  }

  private cosineSimilarity(a: number[], b: number[]) {
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
    const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
    return normA === 0 || normB === 0 ? 0 : dot / (normA * normB);
  }
}
