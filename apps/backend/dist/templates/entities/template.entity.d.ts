import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class Template {
    id: string;
    tenantId: string;
    tenant: Tenant;
    name: string;
    language: string;
    status: string;
    components: any;
    category: string;
    lastSyncedAt: Date;
}
