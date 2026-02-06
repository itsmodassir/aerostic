import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getOverview(req: any): Promise<{
        stats: {
            totalSent: number;
            totalReceived: number;
            totalContacts: number;
            totalAgents: number;
            aiCreditsUsed: number;
            activeCampaigns: number;
        };
        recentCampaigns: import("../campaigns/entities/campaign.entity").Campaign[];
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
