import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Processor('whatsapp-webhooks')
export class WebhooksProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhooksProcessor.name);

  constructor(private readonly webhooksService: WebhooksService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { body } = job.data;
    this.logger.log('Processing enqueued webhook event');

    try {
      // We call a dedicated internal method to avoid re-enqueuing
      await this.webhooksService.handleProcessedPayload(body);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Webhook processing failed: ${error.message}`);
      throw error;
    }
  }
}
