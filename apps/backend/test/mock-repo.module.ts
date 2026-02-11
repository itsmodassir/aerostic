import { Module, Global } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { Tenant } from '../src/tenants/entities/tenant.entity';
import { TenantMembership } from '../src/tenants/entities/tenant-membership.entity';
import { Role } from '../src/tenants/entities/role.entity';
import { AuditLog } from '../src/audit/entities/audit-log.entity';
import { RazorpayEvent } from '../src/billing/entities/razorpay-event.entity';
import { Subscription } from '../src/billing/entities/subscription.entity';
import { ApiKey } from '../src/billing/entities/api-key.entity';
import { WebhookEndpoint } from '../src/billing/entities/webhook-endpoint.entity';
import { UsageMetric } from '../src/billing/entities/usage-metric.entity';
import { WhatsappAccount } from '../src/whatsapp/entities/whatsapp-account.entity';
import { SystemConfig } from '../src/admin/entities/system-config.entity';
import { Message } from '../src/messages/entities/message.entity';
import { Conversation } from '../src/messages/entities/conversation.entity';
import { Contact } from '../src/contacts/entities/contact.entity';

const mockRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
};

@Global()
@Module({
  providers: [
    { provide: getRepositoryToken(User), useValue: mockRepo },
    { provide: getRepositoryToken(Tenant), useValue: mockRepo },
    { provide: getRepositoryToken(TenantMembership), useValue: mockRepo },
    { provide: getRepositoryToken(Role), useValue: mockRepo },
    { provide: getRepositoryToken(AuditLog), useValue: mockRepo },
    { provide: getRepositoryToken(RazorpayEvent), useValue: mockRepo },
    { provide: getRepositoryToken(Subscription), useValue: mockRepo },
    { provide: getRepositoryToken(ApiKey), useValue: mockRepo },
    { provide: getRepositoryToken(WebhookEndpoint), useValue: mockRepo },
    { provide: getRepositoryToken(UsageMetric), useValue: mockRepo },
    { provide: getRepositoryToken(WhatsappAccount), useValue: mockRepo },
    { provide: getRepositoryToken(SystemConfig), useValue: mockRepo },
    { provide: getRepositoryToken(Message), useValue: mockRepo },
    { provide: getRepositoryToken(Conversation), useValue: mockRepo },
    { provide: getRepositoryToken(Contact), useValue: mockRepo },
  ],
  exports: [
    getRepositoryToken(User),
    getRepositoryToken(Tenant),
    getRepositoryToken(TenantMembership),
    getRepositoryToken(Role),
    getRepositoryToken(AuditLog),
    getRepositoryToken(RazorpayEvent),
    getRepositoryToken(Subscription),
    getRepositoryToken(ApiKey),
    getRepositoryToken(WebhookEndpoint),
    getRepositoryToken(UsageMetric),
    getRepositoryToken(WhatsappAccount),
    getRepositoryToken(SystemConfig),
    getRepositoryToken(Message),
    getRepositoryToken(Conversation),
    getRepositoryToken(Contact),
  ],
})
export class MockRepoModule {}
