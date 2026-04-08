import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Campaign } from "./entities/campaign.entity";
import { Message } from "@shared/database/entities/messaging/message.entity";

@Injectable()
export class CampaignAnalyticsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async getCampaignStats(campaignId: string, tenantId: string) {
    const campaign = await this.campaignRepo.findOne({
      where: { id: campaignId, tenantId },
    });

    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }

    // 1. Funnel Data (Sent -> Delivered -> Read -> Converted)
    const funnel = [
      { name: "Sent", value: campaign.sentCount },
      { name: "Delivered", value: campaign.deliveredCount },
      { name: "Read", value: campaign.readCount },
      { name: "Converted", value: campaign.conversionCount },
    ];

    // 2. ROI Metrics
    const cost = parseFloat(campaign.totalCost.toString() || "0");
    const revenue = parseFloat(campaign.totalRevenue.toString() || "0");
    const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;

    // 3. Efficiency Metrics
    const deliveryRate = campaign.sentCount > 0 ? (campaign.deliveredCount / campaign.sentCount) * 100 : 0;
    const readRate = campaign.deliveredCount > 0 ? (campaign.readCount / campaign.deliveredCount) * 100 : 0;
    const conversionRate = campaign.readCount > 0 ? (campaign.conversionCount / campaign.readCount) * 100 : 0;

    return {
      funnel,
      metrics: {
        totalCost: cost,
        totalRevenue: revenue,
        roi: parseFloat(roi.toFixed(2)),
        deliveryRate: parseFloat(deliveryRate.toFixed(2)),
        readRate: parseFloat(readRate.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        costPerConversion: campaign.conversionCount > 0 ? parseFloat((cost / campaign.conversionCount).toFixed(2)) : 0,
      },
    };
  }

  /**
   * Generates mock timeline data for trend visualization (to be replaced with actual log aggregation)
   */
  async getCampaignTimeline(campaignId: string, tenantId: string) {
    const campaign = await this.campaignRepo.findOne({
      where: { id: campaignId, tenantId },
    });

    if (!campaign) throw new NotFoundException("Campaign not found");

    // For now, generating a 24h trend based on the campaign's start date
    const start = campaign.createdAt;
    const data = [];
    
    for (let i = 0; i < 24; i++) {
        const hour = new Date(start.getTime() + i * 3600000);
        data.push({
            time: hour.getHours() + ":00",
            sent: Math.floor(campaign.sentCount / 24 * (1 + Math.random() * 0.5)),
            read: Math.floor(campaign.readCount / 24 * (Math.random())),
            conversions: Math.floor(campaign.conversionCount / 24 * (Math.random())),
        });
    }

    return data;
  }

  /**
   * Detailed side-by-side stats for A/B tests
   */
  async getABTestStats(campaignId: string, tenantId: string) {
    const campaign = await this.campaignRepo.findOneBy({ id: campaignId, tenantId });
    if (!campaign) throw new NotFoundException("Campaign not found");

    const stats = await this.messageRepo
      .createQueryBuilder("message")
      .select("message.templateName", "name")
      .addSelect("COUNT(*)", "sent")
      .addSelect('SUM(CASE WHEN message.status = "delivered" OR message.status = "read" THEN 1 ELSE 0 END)', "delivered")
      .addSelect('SUM(CASE WHEN message.status = "read" THEN 1 ELSE 0 END)', "read")
      .where("message.campaignId = :campaignId", { campaignId })
      .groupBy("message.templateName")
      .getRawMany();

    return stats.map(s => ({
        ...s,
        deliveryRate: s.sent > 0 ? (s.delivered / s.sent * 100).toFixed(2) : 0,
        readRate: s.delivered > 0 ? (s.read / s.delivered * 100).toFixed(2) : 0
    }));
  }

  /**
   * Engagement Heatmap: 7x24 grid of read events
   * Segmented by contact tags if filter provided
   */
  async getEngagementHeatmap(campaignId: string, tenantId: string, tagFilters?: string[]) {
    const query = this.messageRepo
      .createQueryBuilder("msg")
      .select("EXTRACT(DOW FROM msg.readAt)", "day")
      .addSelect("EXTRACT(HOUR FROM msg.readAt)", "hour")
      .addSelect("COUNT(*)", "count")
      .innerJoin("conversations", "conv", "msg.conversationId = conv.id")
      .innerJoin("contacts", "contact", "conv.contactId = contact.id")
      .where("msg.campaignId = :campaignId", { campaignId })
      .andWhere("msg.readAt IS NOT NULL");

    if (tagFilters && tagFilters.length > 0) {
      // Using Postgres JSONB containment operator for tag filtering
      query.andWhere("contact.attributes->'tags' ?| :tags", { tags: tagFilters });
    }

    const raw = await query
      .groupBy("day")
      .addGroupBy("hour")
      .getRawMany();

    // Transform into a frontend-friendly grid
    const heatmap = [];
    for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
            const match = raw.find(r => Number(r.day) === d && Number(r.hour) === h);
            heatmap.push({ day: d, hour: h, value: match ? Number(match.count) : 0 });
        }
    }
    return heatmap;
  }

  /**
   * Predictive Scheduling: Finds the peak engagement hour for the tenant
   * Inspired by bot.space's 'Optimal Timing' engine
   */
  async getOptimalSendTime(tenantId: string) {
      const stats = await this.messageRepo
          .createQueryBuilder("msg")
          .select("EXTRACT(DOW FROM msg.readAt)", "day")
          .addSelect("EXTRACT(HOUR FROM msg.readAt)", "hour")
          .addSelect("COUNT(*)", "count")
          .where("msg.tenantId = :tenantId", { tenantId })
          .andWhere("msg.readAt IS NOT NULL")
          .groupBy("day")
          .addGroupBy("hour")
          .orderBy("count", "DESC")
          .limit(1)
          .getRawOne();

      if (!stats) {
          // Default to Tuesday 10 AM if no data exists
          return { day: 2, hour: 10, confidence: "low", message: "Standard business peak" };
      }

      return {
          day: Number(stats.day),
          hour: Number(stats.hour),
          confidence: stats.count > 50 ? "high" : "medium",
          message: `Peak engagement at ${stats.hour}:00 on ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][stats.day]}`
      };
  }
}
