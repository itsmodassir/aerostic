import { Tenant } from '../../tenants/entities/tenant.entity';
import { Conversation } from './conversation.entity';
export declare class Message {
    id: string;
    tenantId: string;
    tenant: Tenant;
    conversationId: string;
    conversation: Conversation;
    direction: string;
    type: string;
    content: any;
    status: string;
    metaMessageId: string;
    createdAt: Date;
}
