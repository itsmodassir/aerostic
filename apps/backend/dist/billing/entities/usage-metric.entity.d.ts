import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class UsageMetric {
    id: string;
    tenantId: string;
    tenant: Tenant;
    metric: string;
    value: number;
    periodStart: Date;
    periodEnd: Date;
}
