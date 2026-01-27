import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { ContactsService } from '../contacts/contacts.service';
import { MessagesService } from '../messages/messages.service';
import { Queue } from 'bullmq';
export declare class CampaignsService {
    private campaignRepo;
    private contactsService;
    private messagesService;
    private campaignQueue;
    constructor(campaignRepo: Repository<Campaign>, contactsService: ContactsService, messagesService: MessagesService, campaignQueue: Queue);
    create(tenantId: string, name: string): Promise<Campaign>;
    findAll(tenantId: string): Promise<Campaign[]>;
    dispatch(tenantId: string, campaignId: string): Promise<Campaign>;
}
