import { Repository } from 'typeorm';
import { Message } from '../messages/entities/message.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { AiAgent } from '../ai/entities/ai-agent.entity';
import { UsageMetric } from '../billing/entities/usage-metric.entity';
export declare class AnalyticsService {
    private messageRepo;
    private campaignRepo;
    private contactRepo;
    private aiAgentRepo;
    private usageRepo;
    constructor(messageRepo: Repository<Message>, campaignRepo: Repository<Campaign>, contactRepo: Repository<Contact>, aiAgentRepo: Repository<AiAgent>, usageRepo: Repository<UsageMetric>);
    getOverview(tenantId: string): Promise<{
        stats: {
            totalSent: number;
            totalReceived: number;
            totalContacts: number;
            totalAgents: number;
            aiCreditsUsed: number;
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
