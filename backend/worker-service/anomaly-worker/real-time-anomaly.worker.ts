import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { KafkaService } from "@shared/kafka.service";
import { RedisService } from "@shared/redis.service";
import { GlobalAnomalyService } from "./global-anomaly.service";
import { KillSwitchService } from "./kill-switch.service";
import { RiskAggregatorService } from "./risk-aggregator.service";
import { RiskType } from "../../api-service/billing/entities/api-key-risk-event.entity";

@Injectable()
export class RealTimeAnomalyWorker implements OnModuleInit {
  private readonly logger = new Logger(RealTimeAnomalyWorker.name);
  private readonly WINDOW_SECONDS = 60;

  constructor(
    private kafkaService: KafkaService,
    private redisService: RedisService,
    private globalAnomalyService: GlobalAnomalyService,
    private killSwitchService: KillSwitchService,
    private riskAggregator: RiskAggregatorService,
  ) {}

  async onModuleInit() {
    // Subscribe to usage events
    await this.kafkaService.subscribe(
      "anomaly-engine-group",
      "aimstors.usage.events",
      async ({ message }) => {
        if (!message.value) return;
        const event = JSON.parse(message.value.toString());
        await this.processUsageEvent(event);
      },
    );

    // Subscribe to security events
    await this.kafkaService.subscribe(
      "anomaly-engine-group",
      "aimstors.security.events",
      async ({ message }) => {
        if (!message.value) return;
        const event = JSON.parse(message.value.toString());
        await this.processSecurityEvent(event);
      },
    );
  }

  private async processUsageEvent(event: any) {
    const { tenantId, metric, amount, timestamp, metadata } = event;
    const apiKeyId = metadata?.apiKeyId;
    const windowKey = `anomaly:window:${tenantId}:${metric}`;

    // 1. Update sliding window in Redis (using sorted sets for precise 60s window)
    const now = Date.now();
    const client = this.redisService.getClient();
    await client.zadd(windowKey, now, `${event.eventId}:${now}`);
    await client.zremrangebyscore(
      windowKey,
      0,
      now - this.WINDOW_SECONDS * 1000,
    );

    // 2. Check for tenant-level spikes
    const count = await client.zcard(windowKey);
    this.logger.debug(`Tenant ${tenantId} ${metric} window count: ${count}`);

    // Real-time API Key Rate Signal
    if (apiKeyId && count > 1000) {
      await this.killSwitchService.addRiskSignal(
        apiKeyId,
        tenantId,
        RiskType.RATE_SPIKE,
        30,
        { count },
      );
      await this.riskAggregator.updateTenantRiskScore(tenantId, 10);
    }

    // Simple threshold check for real-time (detailed logic in follow-up)
    if (count > 500) {
      // e.g., > 500 messages/min
      await this.triggerAnomalyAlert(
        tenantId,
        "Real-time message spike detected",
        count,
      );
    }

    // 3. Update platform-wide correlation (Sorted set of 'spiking' tenants)
    if (count > 100) {
      const platformKey = `anomaly:platform:active_spikes`;
      const client = this.redisService.getClient();
      await client.zadd(platformKey, now, tenantId);
      await client.zremrangebyscore(
        platformKey,
        0,
        now - this.WINDOW_SECONDS * 1000,
      );

      const spikingTenants = await client.zcard(platformKey);
      if (spikingTenants >= 5) {
        this.logger.warn(
          `PLATFORM CLUSTER DETECTED: ${spikingTenants} tenants spiking simultaneously!`,
        );
        await this.kafkaService.emit("aimstors.anomaly.alerts", {
          type: "PLATFORM_CLUSTER",
          affectedTenants: spikingTenants,
          timestamp: now,
        });
      }
    }
  }

  private async processSecurityEvent(event: any) {
    // Handle login bursts, API key abuse, etc.
    const { tenantId, action, metadata } = event;
    const apiKeyId = metadata?.apiKeyId || event.resourceId; // Fallback to resourceId for API keys

    if (action === "API_KEY_AUTH_FAILED" || action === "LOGIN_FAILED") {
      const failKey = `anomaly:security:fails:${tenantId}`;
      const count = await this.redisService.incr(failKey);
      await this.redisService.expire(failKey, 300); // 5 min window

      if (apiKeyId && count > 50) {
        await this.killSwitchService.addRiskSignal(
          apiKeyId,
          tenantId,
          RiskType.AUTH_SPAM,
          50,
          { failCount: count },
        );
        await this.riskAggregator.updateTenantRiskScore(tenantId, 25);
      }

      if (count > 20) {
        await this.triggerAnomalyAlert(
          tenantId,
          "Security brute-force detected",
          count,
        );
      }
    }
  }

  private async triggerAnomalyAlert(
    tenantId: string,
    reason: string,
    magnitude: number,
  ) {
    this.logger.error(
      `REAL-TIME ANOMALY: Tenant ${tenantId} - ${reason} (${magnitude})`,
    );

    await this.kafkaService.emit("aimstors.anomaly.alerts", {
      type: "TENANT_ANOMALY",
      tenantId,
      reason,
      magnitude,
      timestamp: Date.now(),
    });
  }
}
