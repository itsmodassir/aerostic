import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MessagesService } from '../messages/messages.service';
import { Campaign } from './entities/campaign.entity';
import { Repository } from 'typeorm';
export declare class CampaignProcessor extends WorkerHost {
    private messagesService;
    private campaignRepo;
    constructor(messagesService: MessagesService, campaignRepo: Repository<Campaign>);
    process(job: Job<any, any, string>): Promise<any>;
}
