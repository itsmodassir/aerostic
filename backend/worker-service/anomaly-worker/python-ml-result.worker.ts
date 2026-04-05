import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { KafkaService } from "@shared/kafka.service";
import { KillSwitchService } from "./kill-switch.service";
import { RiskAggregatorService } from "./risk-aggregator.service";
import { RiskType } from "../../api-service/billing/entities/api-key-risk-event.entity";

@Injectable()
export class PythonMLResultWorker implements OnModuleInit {
  private readonly logger = new Logger(PythonMLResultWorker.name);

  constructor(
    private kafkaService: KafkaService,
    private killSwitchService: KillSwitchService,
    private riskAggregator: RiskAggregatorService,
  ) {}

  async onModuleInit() {
    this.logger.log("🚀 Python ML Result Worker starting... (Shadow Mode)");

    await this.kafkaService.subscribe(
      "python-ml-result-group",
      "aerostic.anomaly.results",
      async ({ message }) => {
        if (!message.value) return;
        const result = JSON.parse(message.value.toString());
        this.processMLResult(result);
      },
    );
  }

  private async processMLResult(result: any) {
    const { tenant_id, api_key_id, score, model } = result;

    this.logger.warn(
      `📊 [ACTIVE MODE] Python ML (${model}) detected anomaly: Tenant=${tenant_id}, Score=${score}`,
    );

    // In Active Mode, we aggregate risk and trigger safety protocols
    // if the ML signal is highly confident.

    if (api_key_id && tenant_id) {
      // Contribute to risk score with a specialized ML Signal
      // This allows the Node system to see the RL-tuned impact.
      const riskWeight = score > 80 ? 50 : 25;
      
      await this.killSwitchService.addRiskSignal(
        api_key_id,
        tenant_id,
        RiskType.AI_ML_SIGNAL,
        riskWeight,
        { mlScore: score, model },
      );

      // Persist to aggregation
      await this.riskAggregator.updateTenantRiskScore(tenant_id, score / 10);
    }
  }
}
