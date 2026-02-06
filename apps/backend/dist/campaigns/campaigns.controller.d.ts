import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    create(tenantId: string, body: any): Promise<import("./entities/campaign.entity").Campaign>;
    findAll(tenantId: string): Promise<import("./entities/campaign.entity").Campaign[]>;
    send(tenantId: string, id: string): Promise<import("./entities/campaign.entity").Campaign>;
}
