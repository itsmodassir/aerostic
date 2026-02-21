import { Injectable, Logger } from "@nestjs/common";
import { FeatureExtractorService } from "./feature-extractor.service";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class AnomalyService {
  private readonly logger = new Logger(AnomalyService.name);
  private readonly mlServiceUrl: string;

  constructor(
    private extractor: FeatureExtractorService,
    private configService: ConfigService,
  ) {
    this.mlServiceUrl =
      this.configService.get("ML_SERVICE_URL") || "http://localhost:8000";
  }

  async evaluate(event: any) {
    try {
      const features = this.extractor.extract(event);

      const response = await axios.post(
        `${this.mlServiceUrl}/predict`,
        features,
      );

      const result = response.data;
      this.logger.debug(
        `ML Prediction for ${event.tenantId}: Risk=${result.risk_score} (Anomaly: ${result.is_anomaly})`,
      );

      return result.anomaly_score; // Return score for downstream risk aggregation
    } catch (err) {
      this.logger.error(
        `Python ML Inference failed for ${event.tenantId}`,
        err.message,
      );
      // Fallback to basic heuristic if ML service is down
      return this.fallbackEvaluate(event);
    }
  }

  private fallbackEvaluate(event: any): number {
    // Simple heuristic fallback
    return (
      (event.failure_rate || 0) * 0.5 + (event.message_rate_1m > 1000 ? 0.5 : 0)
    );
  }

  async train(tenantId: string, historicalData: any[]) {
    this.logger.warn(
      `Retraining currently deferred to Python ML training pipeline for tenant ${tenantId}`,
    );
    // In full prod, we would trigger the Python training endpoint here
  }
}
