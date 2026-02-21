import { OnWorkerEvent, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { METRICS_QUEUE } from "../shared/queue/queue-names";

export abstract class BaseWorker extends WorkerHost {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(@InjectQueue(METRICS_QUEUE) protected metricsQueue: Queue) {
    super();
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} of queue ${job.queueName} completed.`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} of queue ${job.queueName} failed: ${error.message}`,
    );
  }

  /**
   * Standard way to track usage after a successful job execution.
   */
  async trackUsage(
    tenantId: string,
    metric: string,
    amount: number,
    referenceId?: string,
  ) {
    await this.metricsQueue.add("track_usage", {
      tenantId,
      metric,
      amount,
      referenceId,
      timestamp: new Date().toISOString(),
    });
  }
}
