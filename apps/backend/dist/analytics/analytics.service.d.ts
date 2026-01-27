import { Repository } from 'typeorm';
import { Message } from '../messages/entities/message.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Contact } from '../contacts/entities/contact.entity';
export declare class AnalyticsService {
    private messageRepo;
    private campaignRepo;
    private contactRepo;
    constructor(messageRepo: Repository<Message>, campaignRepo: Repository<Campaign>, contactRepo: Repository<Contact>);
    getOverview(tenantId: string): Promise<{
        stats: {
            totalSent: number;
            totalReceived: number;
            totalContacts: number;
            activeCampaigns: number;
        };
        recentCampaigns: Campaign[];
        recentMessages: {
            id: string;
            type: string;
            direction: string;
            status: string;
            createdAt: Date;
            contactName: string;
        }[];
    }>;
}
