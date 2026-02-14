import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Message } from '../messages/entities/message.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { AiAgent } from '../ai/entities/ai-agent.entity';
import { UsageMetric } from '../billing/entities/usage-metric.entity';
import { subDays, startOfDay, endOfDay } from 'date-fns';

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
  ) { }

  async getOverview(tenantId: string) {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    const [totalSent, totalReceived, totalContacts, totalAgents, dailyStats] =
      await Promise.all([
        this.messageRepo.count({ where: { tenantId, direction: 'out' } }),
        this.messageRepo.count({ where: { tenantId, direction: 'in' } }),
        this.contactRepo.count({ where: { tenantId } }),
        this.aiAgentRepo.count({ where: { tenantId } }),
        this.getDailyStats(tenantId, sevenDaysAgo, now),
      ]);

    const statusBreakdown = await this.messageRepo
      .createQueryBuilder('message')
      .select('message.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('message.tenantId = :tenantId', { tenantId })
      .andWhere('message.direction = :direction', { direction: 'out' })
      .groupBy('message.status')
      .getRawMany();

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
        statusBreakdown: statusBreakdown.reduce((acc, curr) => {
          acc[curr.status] = parseInt(curr.count);
          return acc;
        }, {}),
      },
      dailyStats,
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

  private async getDailyStats(tenantId: string, start: Date, end: Date) {
    const stats = [];
    let current = startOfDay(start);
    const stop = endOfDay(end);

    while (current <= stop) {
      const dayStart = startOfDay(current);
      const dayEnd = endOfDay(current);

      const [sent, received] = await Promise.all([
        this.messageRepo.count({
          where: {
            tenantId,
            direction: 'out',
            createdAt: Between(dayStart, dayEnd),
          },
        }),
        this.messageRepo.count({
          where: {
            tenantId,
            direction: 'in',
            createdAt: Between(dayStart, dayEnd),
          },
        }),
      ]);

      stats.push({
        date: dayStart.toISOString().split('T')[0],
        sent,
        received,
      });

      current = subDays(current, -1);
    }

    return stats;
  }
}

