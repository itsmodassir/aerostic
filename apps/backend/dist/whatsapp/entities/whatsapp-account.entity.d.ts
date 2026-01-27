import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class WhatsappAccount {
    id: string;
    tenantId: string;
    tenant: Tenant;
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber: string;
    mode: string;
    status: string;
    createdAt: Date;
}
