import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual, IsNull, Or } from "typeorm";
import { Campaign } from "./entities/campaign.entity";
import { CampaignsService } from "./campaigns.service";

@Injectable()
export class CampaignCronService {
  private readonly logger = new Logger(CampaignCronService.name);

  constructor(
    @InjectRepository(Campaign)
    private campaignRepo: Repository<Campaign>,
    private campaignsService: CampaignsService,
  ) {}

  @Cron("* * * * *") // Pulse every minute
  async handleCron() {
    this.logger.debug("Pulsing Campaign Scheduler...");

    const now = new Date();

    // 1. Find Scheduled Campaigns that are due (One-time)
    const scheduledDue = await this.campaignRepo.find({
      where: {
        status: "scheduled",
        scheduledAt: LessThanOrEqual(now),
      },
    });

    // 2. Find Recurring Campaigns that are due
    const recurringDue = await this.campaignRepo.find({
      where: {
        isRecurring: true,
        nextRunAt: LessThanOrEqual(now),
      },
    });

    const allDue = [...scheduledDue, ...recurringDue];

    if (allDue.length === 0) return;

    this.logger.log(`Found ${allDue.length} campaigns due for dispatch.`);

    for (const campaign of allDue) {
      try {
        await this.campaignsService.dispatch(campaign.tenantId, campaign.id);
        this.logger.log(`Successfully dispatched campaign: ${campaign.name}`);
      } catch (err) {
        this.logger.error(
          `Failed to dispatch campaign ${campaign.id}: ${campaign.name}`,
          err,
        );
        // Dispatch method in CampaignsService already handles error logging to the DB
      }
    }
  }
}
