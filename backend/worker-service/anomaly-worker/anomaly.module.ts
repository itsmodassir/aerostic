import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { AnomalyProcessor } from "./anomaly.processor";
import { AnomalyService } from "./anomaly.service";
import { FeatureExtractorService } from "./feature-extractor.service";
import { RiskEngineService } from "./risk-engine.service";
import { AnomalyEvent } from "../../shared/database/entities/analytics/anomaly-event.entity";
import { TenantRiskScore } from "../../shared/database/entities/analytics/tenant-risk-score.entity";
import { TenantHourlyMetric } from "../../shared/database/entities/analytics/tenant-hourly-metric.entity";
import { PlatformAnomalyCluster } from "../../shared/database/entities/analytics/platform-anomaly-cluster.entity";
import { RedisService } from "../../shared/redis.service";
import { ANOMALY_QUEUE } from "../../shared/queue/queue-names";
import { GlobalAnomalyService } from "./global-anomaly.service";
import { RealTimeAnomalyWorker } from "./real-time-anomaly.worker";
import { PythonMLResultWorker } from "./python-ml-result.worker";
import { ClusterMitigationWorker } from "./cluster-mitigation.worker";
import { SuspensionPolicyService } from "./suspension-policy.service";
import { KillSwitchService } from "./kill-switch.service";
import { RiskAggregatorService } from "./risk-aggregator.service";
import { ApiKey } from "@shared/database/entities/core/api-key.entity";
import { ApiKeyRiskEvent } from "../../api-service/billing/entities/api-key-risk-event.entity";
import { PlatformRiskSnapshot } from "../../shared/database/entities/analytics/platform-risk-snapshot.entity";
import { ResellerRiskScore } from "../../shared/database/entities/analytics/reseller_risk_score.entity";
import { AnomalyVector } from "../../shared/database/entities/analytics/anomaly-vector.entity";
import { RLPolicy } from "../../shared/database/entities/analytics/rl-policy.entity";
import { RLExperience } from "../../shared/database/entities/analytics/rl-experience.entity";
import { AdminRiskController } from "./admin-risk.controller";
import { AdaptiveThresholdService } from "./adaptive-threshold.service";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      AnomalyEvent,
      TenantRiskScore,
      PlatformAnomalyCluster,
      TenantHourlyMetric,
      ApiKey,
      ApiKeyRiskEvent,
      PlatformRiskSnapshot,
      ResellerRiskScore,
      RLPolicy,
      RLExperience,
      AnomalyVector,
    ]),
    BullModule.registerQueue({
      name: ANOMALY_QUEUE,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AdminRiskController],
  providers: [
    AnomalyService,
    FeatureExtractorService,
    AnomalyProcessor,
    RiskEngineService,
    RedisService,
    GlobalAnomalyService,
    RealTimeAnomalyWorker,
    PythonMLResultWorker,
    ClusterMitigationWorker,
    SuspensionPolicyService,
    KillSwitchService,
    RiskAggregatorService,
    AdaptiveThresholdService,
  ],
  exports: [
    AnomalyService,
    GlobalAnomalyService,
    RiskAggregatorService,
    AdaptiveThresholdService,
  ],
})
export class AnomalyWorkerModule {}
