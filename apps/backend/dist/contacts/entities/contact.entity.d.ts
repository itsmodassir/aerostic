import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class Contact {
    id: string;
    tenantId: string;
    tenant: Tenant;
    phoneNumber: string;
    name: string;
    email: string;
    attributes: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
