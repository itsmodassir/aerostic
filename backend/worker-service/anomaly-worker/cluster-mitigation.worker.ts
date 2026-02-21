import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { KafkaService } from "@shared/kafka.service";
import { RedisService } from "@shared/redis.service";
import { RiskAggregatorService } from "./risk-aggregator.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  PlatformAnomalyCluster,
  ClusterRiskLevel,
} from "../../shared/database/entities/analytics/platform-anomaly-cluster.entity";

@Injectable()
export class ClusterMitigationWorker implements OnModuleInit {
  private readonly logger = new Logger(ClusterMitigationWorker.name);

  constructor(
    private kafkaService: KafkaService,
    private redisService: RedisService,
    private riskAggregator: RiskAggregatorService,
    @InjectRepository(PlatformAnomalyCluster)
    private clusterRepo: Repository<PlatformAnomalyCluster>,
  ) {}

  async onModuleInit() {
    this.logger.log("🚀 Cluster Mitigation Worker starting...");

    await this.kafkaService.subscribe(
      "cluster-mitigation-group",
      "aerostic.platform.cluster.events",
      async ({ message }) => {
        if (!message.value) return;
        const clusterEvent = JSON.parse(message.value.toString());
        await this.handleCluster(clusterEvent);
      },
    );
  }

  private async handleCluster(event: any) {
    const { tenants, risk_score, type } = event;

    this.logger.error(
      `🚨 COORDINATED ATTACK DETECTED: ${tenants.length} tenants in cluster!`,
    );

    // 1. Persist Cluster
    const cluster = this.clusterRepo.create({
      clusterSignature: `${type}_${Date.now()}`,
      affectedTenantCount: tenants.length,
      riskLevel: this.mapScoreToRiskLevel(risk_score),
      metadata: { tenants, ...event },
    });
    await this.clusterRepo.save(cluster);

    // 2. Escalate Risk for every tenant in the cluster
    for (const tenantId of tenants) {
      await this.riskAggregator.updateTenantRiskScore(tenantId, 15); // Hard escalation
    }

    // 3. Broadcast to Admin Panel Heatmap (via Redis bridge to RiskGateway in api-service)
    await this.redisService.publish("security_alerts", {
      type: "CLUSTER_DETECTED",
      message: `Coordinated ${type} attack involving ${tenants.length} tenants!`,
      severity: "HIGH",
      metadata: { clusterId: cluster.id, tenantCount: tenants.length },
    });
  }

  private mapScoreToRiskLevel(score: number): ClusterRiskLevel {
    if (score >= 50) return ClusterRiskLevel.CRITICAL;
    if (score >= 25) return ClusterRiskLevel.HIGH;
    return ClusterRiskLevel.WARNING;
  }
}
