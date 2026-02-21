import { Injectable, Logger } from "@nestjs/common";
import { RiskType } from "../../api-service/billing/entities/api-key-risk-event.entity";

@Injectable()
export class SuspensionPolicyService {
  private readonly logger = new Logger(SuspensionPolicyService.name);

  // Weights for different signal types
  private readonly WEIGHTS: Record<RiskType, number> = {
    [RiskType.RATE_SPIKE]: 30,
    [RiskType.FAILURE_SPIKE]: 25,
    [RiskType.AUTH_SPAM]: 20,
    [RiskType.IP_ROTATION]: 15,
    [RiskType.AI_ML_SIGNAL]: 35,
    [RiskType.GEO_ANOMALY]: 20,
    [RiskType.MALICIOUS_IP]: 50,
    [RiskType.CROSS_TENANT_CLUSTER]: 35,
  };

  private readonly SUSPENSION_THRESHOLD = 80;
  private readonly WARNING_THRESHOLD = 50;

  /**
   * Evaluates whether a set of signals justifies a suspension.
   * Rule: Must have > SUSPENSION_THRESHOLD AND
   * at least 2 different risk categories.
   */
  evaluate(
    currentScore: number,
    signalCategories: Set<RiskType>,
  ): {
    shouldSuspend: boolean;
    shouldWarn: boolean;
    reason: string;
  } {
    const hasHighScorce = currentScore >= this.SUSPENSION_THRESHOLD;
    const hasMultiSignal = signalCategories.size >= 2;

    if (hasHighScorce && hasMultiSignal) {
      return {
        shouldSuspend: true,
        shouldWarn: false,
        reason: `Multi-signal high risk detected (${Array.from(signalCategories).join(", ")})`,
      };
    }

    if (currentScore >= this.WARNING_THRESHOLD) {
      return {
        shouldSuspend: false,
        shouldWarn: true,
        reason: "Elevated risk score - entering warning mode",
      };
    }

    return { shouldSuspend: false, shouldWarn: false, reason: "Safe" };
  }

  getWeightForSignal(type: RiskType): number {
    return this.WEIGHTS[type] || 10;
  }
}
