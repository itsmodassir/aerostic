import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class RiskEngineService {
  private readonly logger = new Logger(RiskEngineService.name);

  classify(score: number) {
    if (score > 0.85) return "critical";
    if (score > 0.75) return "high";
    if (score > 0.6) return "warning";
    return "normal";
  }

  async handleRisk(event: any, risk: string) {
    this.logger.warn(
      `Anomaly escalation for ${event.tenantId}: ${risk.toUpperCase()} (Score: ${event.score})`,
    );

    if (risk === "critical") {
      this.logger.error(
        `🚨 CRITICAL anomaly detected for tenant ${event.tenantId}. Initiating hardening.`,
      );
      // TODO: Call TenantService.suspend or ApiKeyService.disable
    } else if (risk === "high") {
      this.logger.warn(
        `HIGH risk for tenant ${event.tenantId}. Flagging for review.`,
      );
      // TODO: Trigger Slack/Email alert
    }
  }
}
