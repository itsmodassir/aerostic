import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getOverview(tenantId: string): Promise<{
        stats: {
            totalSent: number;
            totalReceived: number;
            totalContacts: number;
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
