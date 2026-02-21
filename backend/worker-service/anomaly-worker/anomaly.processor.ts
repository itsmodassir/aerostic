import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { AnomalyService } from "./anomaly.service";
import { RiskEngineService } from "./risk-engine.service";
import { ANOMALY_QUEUE } from "../../shared/queue/queue-names";
import { Logger } from "@nestjs/common";

@Processor(ANOMALY_QUEUE)
export class AnomalyProcessor extends WorkerHost {
  private readonly logger = new Logger(AnomalyProcessor.name);

  constructor(
    private anomalyService: AnomalyService,
    private riskEngine: RiskEngineService,
  ) {
    super();
  }

  async process(job: Job<any>) {
    const event = job.data;
    const score = await this.anomalyService.evaluate(event);
    const risk = this.riskEngine.classify(score);

    this.logger.debug(
      `Tenant ${event.tenantId} evaluation: Score=${score.toFixed(4)}, Risk=${risk}`,
    );

    if (risk !== "normal") {
      await this.riskEngine.handleRisk({ ...event, score }, risk);
    }

    return { score, risk };
  }
}
