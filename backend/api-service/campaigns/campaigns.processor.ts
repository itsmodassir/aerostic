import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { MessagesService } from "../messages/messages.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Campaign } from "./entities/campaign.entity";
import { Repository } from "typeorm";

@Processor("campaign-queue")
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

    try {
      await this.messagesService.send({
        tenantId,
        to,
        type,
        payload,
        skipBilling: true,
        campaignId,
      });
      // Update stats (Naive approach: DB write per message.
      // Better: Redis increment then bulk update, but keeping simple for MVP)
      await this.campaignRepo.increment({ id: campaignId }, "sentCount", 1);
      await this.refreshCampaignStatus(campaignId);
    } catch (e) {
      console.error(`Failed to send campaign msg to ${to}`, e);
      await this.campaignRepo.increment({ id: campaignId }, "failedCount", 1);
      await this.refreshCampaignStatus(campaignId);
    }
  }

  private async refreshCampaignStatus(campaignId: string) {
    const campaign = await this.campaignRepo.findOneBy({ id: campaignId });
    if (!campaign || !campaign.totalContacts) return;

    const processedCount = (campaign.sentCount || 0) + (campaign.failedCount || 0);
    if (processedCount < campaign.totalContacts) {
      return;
    }

    campaign.status = campaign.sentCount > 0 ? "completed" : "failed";
    await this.campaignRepo.save(campaign);
  }
}
