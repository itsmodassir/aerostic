import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class WhatsappAccount {
    id: string;
    tenantId: string;
    tenant: Tenant;
    businessId: string;
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber: string;
    verifiedName: string;
    qualityRating: string;
    accessToken: string;
    tokenExpiresAt: Date;
    mode: string;
    status: string;
    webhookVerified: boolean;
    messagingLimit: string;
    lastSyncedAt: Date;
    messageCount: number;
    createdAt: Date;
    updatedAt: Date;
}
