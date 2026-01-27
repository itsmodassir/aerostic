import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class AiAgent {
    id: string;
    tenantId: string;
    tenant: Tenant;
    name: string;
    active: boolean;
    systemPrompt: string;
    confidenceThreshold: number;
}
