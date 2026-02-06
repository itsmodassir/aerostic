import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../messages/entities/message.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { AiAgent } from '../ai/entities/ai-agent.entity';
import { UsageMetric } from '../billing/entities/usage-metric.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(Campaign)
    private campaignRepo: Repository<Campaign>,
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(AiAgent)
    private aiAgentRepo: Repository<AiAgent>,
    @InjectRepository(UsageMetric)
    private usageRepo: Repository<UsageMetric>,
  ) {}

  async getOverview(tenantId: string) {
    const [totalSent, totalReceived] = await Promise.all([
      this.messageRepo.count({ where: { tenantId, direction: 'out' } }),
      this.messageRepo.count({ where: { tenantId, direction: 'in' } }),
    ]);

    const totalContacts = await this.contactRepo.count({ where: { tenantId } });
    const totalAgents = await this.aiAgentRepo.count({ where: { tenantId } });

    // Calculate AI credits (for now, just sum tokens or use a default)
    const aiCreditsResult = await this.usageRepo.findOne({
      where: { tenantId, metric: 'ai_credits' },
      order: { periodStart: 'DESC' },
    });

    const campaigns = await this.campaignRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentMessages = await this.messageRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['conversation', 'conversation.contact'],
    });

    return {
      stats: {
        totalSent,
        totalReceived,
        totalContacts,
        totalAgents,
        aiCreditsUsed: aiCreditsResult?.value || 0,
        activeCampaigns: campaigns.filter((c) => c.status === 'sending').length,
      },
      recentCampaigns: campaigns,
      recentMessages: recentMessages.map((m) => ({
        id: m.id,
        type: m.type,
        direction: m.direction,
        status: m.status,
        createdAt: m.createdAt,
        contactName: m.conversation?.contact?.name || 'Unknown',
      })),
    };
  }
}
