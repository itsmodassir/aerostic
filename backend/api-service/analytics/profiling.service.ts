import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TenantBehaviorProfile } from "../../shared/database/entities/analytics/behavior-profile.entity";
import { TenantDailyMetric } from "../../shared/database/entities/analytics/tenant-daily-metric.entity";

@Injectable()
export class ProfilingService {
  private readonly logger = new Logger(ProfilingService.name);

  constructor(
    @InjectRepository(TenantBehaviorProfile)
    private profileRepo: Repository<TenantBehaviorProfile>,
    @InjectRepository(TenantDailyMetric)
    private metricRepo: Repository<TenantDailyMetric>,
  ) {}

  /**
   * Daily job to update behavior baselines using last 30 days of data
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateBaselines() {
    this.logger.log("Starting daily behavioral profiling job...");

    // Get all profiles
    const profiles = await this.profileRepo.find();

    for (const profile of profiles) {
      try {
        await this.calculateBaselineForTenant(profile);
      } catch (err) {
        this.logger.error(
          `Failed to update baseline for tenant ${profile.tenantId}`,
          err.stack,
        );
      }
    }

    this.logger.log("Behavioral profiling job completed.");
  }

  private async calculateBaselineForTenant(profile: TenantBehaviorProfile) {
    // Fetch last 30 days of metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const metrics = await this.metricRepo.find({
      where: {
        tenantId: profile.tenantId,
        // Assuming date is part of entity, need to verify
      },
      order: { date: "DESC" } as any,
      take: 30,
    });

    if (metrics.length < 5) return; // Not enough data for baseline

    const messageCounts = metrics.map((m) => m.messageCount);
    // const apiCounts = metrics.map(m => m.apiCallCount); // Need to ensure metric entity has this

    profile.avgMessagesPerDay = this.calculateMean(messageCounts);
    profile.stdMessagesPerDay = this.calculateStdDev(
      messageCounts,
      profile.avgMessagesPerDay,
    );

    // Update profiling metadata (e.g., usual countries - sample logic)
    // profile.usualCountries = [...new Set(metrics.map(m => m.topCountry))];

    await this.profileRepo.save(profile);
  }

  private calculateMean(numbers: number[]): number {
    return numbers.reduce((acc, val) => acc + val, 0) / numbers.length;
  }

  private calculateStdDev(numbers: number[], mean: number): number {
    const variance =
      numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
      numbers.length;
    return Math.sqrt(variance);
  }
}
