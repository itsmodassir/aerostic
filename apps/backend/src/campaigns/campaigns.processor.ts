import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MessagesService } from '../messages/messages.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Campaign } from './entities/campaign.entity';
import { Repository } from 'typeorm';

@Processor('campaign-queue')
export class CampaignProcessor extends WorkerHost {
  constructor(
    private messagesService: MessagesService,
    @InjectRepository(Campaign)
    private campaignRepo: Repository<Campaign>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { tenantId, to, type, payload, campaignId } = job.data;
    console.log(`Processing Campaign Job for ${to} (Campaign ${campaignId})`);

    try {
      await this.messagesService.send({
        tenantId,
        to,
        type,
        payload,
      });
      // Update stats (Naive approach: DB write per message.
      // Better: Redis increment then bulk update, but keeping simple for MVP)
      await this.campaignRepo.increment({ id: campaignId }, 'sentCount', 1);
    } catch (e) {
      console.error(`Failed to send campaign msg to ${to}`, e);
      await this.campaignRepo.increment({ id: campaignId }, 'failedCount', 1);
    }
  }
}
