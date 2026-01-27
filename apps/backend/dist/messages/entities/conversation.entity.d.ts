import { Tenant } from '../../tenants/entities/tenant.entity';
import { Contact } from '../../contacts/entities/contact.entity';
import { User } from '../../users/entities/user.entity';
export declare class Conversation {
    id: string;
    tenantId: string;
    tenant: Tenant;
    phoneNumberId: string;
    contactId: string;
    contact: Contact;
    assignedAgentId: string;
    assignedAgent: User;
    status: string;
    lastMessageAt: Date;
    createdAt: Date;
}
