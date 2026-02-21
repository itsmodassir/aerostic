import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { WhatsappAccount } from "../whatsapp/entities/whatsapp-account.entity";
import { MetaService } from "./meta.service";
import { SystemConfig } from "@api/admin/entities/system-config.entity";
import { RedisService } from "@shared/redis.service";

@Injectable()
export class MetaTokenService {
  private readonly logger = new Logger(MetaTokenService.name);

  constructor(
    @InjectRepository(WhatsappAccount)
    private whatsappAccountRepo: Repository<WhatsappAccount>,
    @InjectRepository(SystemConfig)
    private configRepo: Repository<SystemConfig>,
    private metaService: MetaService,
    private redisService: RedisService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleTokenRefresh() {
    this.logger.log(
      "Running automated WhatsApp token refresh job (Multi-Tenant)...",
    );

    // Find accounts expiring in the next 10 days
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

    const accountsToRefresh = await this.whatsappAccountRepo.find({
      where: {
        tokenExpiresAt: LessThan(tenDaysFromNow),
        status: "connected",
      },
    });

    if (accountsToRefresh.length === 0) {
      this.logger.log("No tenant tokens requiring refresh found.");
      return;
    }

    // Fetch App ID and Secret from DB
    const dbConfigs = await this.configRepo.find({
      where: [{ key: "meta.app_id" }, { key: "meta.app_secret" }],
    });

    const appId = dbConfigs.find((c) => c.key === "meta.app_id")?.value;
    const appSecret = dbConfigs.find((c) => c.key === "meta.app_secret")?.value;

    if (!appId || !appSecret) {
      this.logger.error(
        "Meta App ID or Secret missing in configuration. Skipping refresh.",
      );
      return;
    }

    for (const account of accountsToRefresh) {
      try {
        if (!account.accessToken) continue;

        this.logger.log(
          `Refreshing token for account ${account.phoneNumberId} (Tenant: ${account.tenantId})...`,
        );

        const longTokenData = await this.metaService.exchangeForLongLivedToken(
          account.accessToken,
          appId,
          appSecret,
        );

        account.accessToken = longTokenData.access_token;
        account.tokenExpiresAt = new Date(
          Date.now() + (longTokenData.expires_in || 5184000) * 1000,
        );

        await this.whatsappAccountRepo.save(account);

        // Invalidate cache for refreshed token
        await this.redisService.del(`whatsapp:token:${account.tenantId}`);

        this.logger.log(
          `Successfully refreshed token for ${account.phoneNumberId}. New expiry: ${account.tokenExpiresAt?.toISOString() ?? "unknown"}`,
        );
      } catch (error: any) {
        this.logger.error(
          `Failed to refresh token for ${account.phoneNumberId}: ${error.message}`,
        );
      }
    }
  }
}
