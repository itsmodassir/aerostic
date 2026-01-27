import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class AutomationRule {
    id: string;
    tenantId: string;
    tenant: Tenant;
    name: string;
    trigger: string;
    condition: string;
    keyword: string;
    action: string;
    payload: any;
    isActive: boolean;
    createdAt: Date;
}
