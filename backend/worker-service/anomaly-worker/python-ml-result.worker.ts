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
      "aimstors.anomaly.results",
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
      `📊 [Shadow Mode] Python ML (${model}) detected anomaly: Tenant=${tenant_id}, Score=${score}`,
    );

    // In Shadow Mode, we log and aggregate risk but DON'T immediately trigger a kill-switch
    // unless the score is exceptionally high (extreme outliers).

    if (api_key_id && tenant_id) {
      // Contribute to risk score but with a specialized ML Signal
      // This allows the Node system to see the RL-tuned impact.
      await this.killSwitchService.addRiskSignal(
        api_key_id,
        tenant_id,
        RiskType.AI_ML_SIGNAL,
        20, // Moderate additional weight from AI
        { mlScore: score, model },
      );

      await this.riskAggregator.updateTenantRiskScore(tenant_id, 5);
    }
  }
}
