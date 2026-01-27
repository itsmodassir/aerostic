import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class Campaign {
    id: string;
    tenantId: string;
    tenant: Tenant;
    name: string;
    templateId: string;
    template: any;
    scheduledAt: Date;
    status: string;
    totalContacts: number;
    sentCount: number;
    failedCount: number;
    createdAt: Date;
}
