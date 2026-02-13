import { Injectable, BadRequestException } from '@nestjs/common';
import * as qs from 'querystring';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { WhatsappAccount } from './entities/whatsapp-account.entity';
import { RedisService } from '../common/redis.service';
import { EncryptionService } from '../common/encryption.service';

@Injectable()
export class WhatsappService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(SystemConfig)
    private configRepo: Repository<SystemConfig>,
    @InjectRepository(WhatsappAccount)
    private whatsappAccountRepo: Repository<WhatsappAccount>,
    @InjectQueue('whatsapp-messages')
    private messageQueue: Queue,
    private redisService: RedisService,
    private encryptionService: EncryptionService,
  ) { }

  async getEmbeddedSignupUrl(tenantId: string) {
    // Fetch config from DB first, fallback to env
    const dbConfigs = await this.configRepo.find({
      where: [{ key: 'meta.app_id' }, { key: 'meta.redirect_uri' }],
    });

    const appId =
      dbConfigs.find((c) => c.key === 'meta.app_id')?.value?.trim() ||
      this.configService.get('META_APP_ID')?.trim();
    const redirectUri =
      dbConfigs.find((c) => c.key === 'meta.redirect_uri')?.value?.trim() ||
      this.configService.get('META_REDIRECT_URI')?.trim() ||
      'http://localhost:3000/meta/callback';

    const params = qs.stringify({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: [
        'whatsapp_business_management',
        'whatsapp_business_messaging',
        'business_management',
      ].join(','),
      response_type: 'code',
      state: tenantId,
    });

    return `https://www.facebook.com/v22.0/dialog/oauth?${params}`;
  }
  async getCredentials(tenantId: string) {
    const cacheKey = `whatsapp:token:${tenantId}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const account = await this.whatsappAccountRepo.findOne({
      where: { tenantId },
    });
    if (!account) return null;

    const credentials = {
      wabaId: account.wabaId,
      phoneNumberId: account.phoneNumberId,
      accessToken: this.encryptionService.decrypt(account.accessToken),
    };

    // Cache for 1 hour
    await this.redisService.set(cacheKey, JSON.stringify(credentials), 3600);

    return credentials;
  }

  async getStatus(tenantId: string) {
    const account = await this.whatsappAccountRepo.findOne({
      where: { tenantId },
    });
    if (!account) return { connected: false };

    return {
      connected: account.status === 'connected',
      mode: account.mode,
      phoneNumber: account.displayPhoneNumber,
      wabaId: account.wabaId,
      qualityRating: account.qualityRating,
    };
  }

  async getPublicConfig() {
    const dbConfigs = await this.configRepo.find({
      where: [
        { key: 'meta.app_id' },
        { key: 'meta.config_id' },
        { key: 'meta.redirect_uri' },
      ],
    });

    return {
      appId:
        dbConfigs.find((c) => c.key === 'meta.app_id')?.value?.trim() ||
        this.configService.get('META_APP_ID')?.trim(),
      configId:
        dbConfigs.find((c) => c.key === 'meta.config_id')?.value?.trim() ||
        this.configService.get('META_CONFIG_ID')?.trim(),
      redirectUri:
        dbConfigs.find((c) => c.key === 'meta.redirect_uri')?.value?.trim() ||
        this.configService.get('META_REDIRECT_URI')?.trim() ||
        'https://app.aerostic.com/meta/callback',
    };
  }

  async disconnect(tenantId: string) {
    return this.whatsappAccountRepo.delete({ tenantId });
  }

  async sendTestMessage(tenantId: string, to: string) {
    const credentials = await this.getCredentials(tenantId);
    if (!credentials || !credentials.accessToken) {
      throw new BadRequestException(
        'WhatsApp account not connected for this tenant',
      );
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'template',
      template: {
        name: 'hello_world',
        language: {
          code: 'en_US',
        },
      },
    };

    // Enqueue with minimal data. Processor will re-fetch (and use cache)
    await this.messageQueue.add(
      'send-test',
      {
        tenantId,
        to,
        payload,
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    return { success: true, message: 'Message enqueued for delivery' };
  }
}
