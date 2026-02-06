import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { WhatsappAccount } from './entities/whatsapp-account.entity';
import { RedisService } from '../common/redis.service';
export declare class WhatsappService {
    private configService;
    private configRepo;
    private whatsappAccountRepo;
    private messageQueue;
    private redisService;
    constructor(configService: ConfigService, configRepo: Repository<SystemConfig>, whatsappAccountRepo: Repository<WhatsappAccount>, messageQueue: Queue, redisService: RedisService);
    getEmbeddedSignupUrl(tenantId: string): Promise<string>;
    getCredentials(tenantId: string): Promise<any>;
    getStatus(tenantId: string): Promise<{
        connected: boolean;
        mode?: undefined;
        phoneNumber?: undefined;
        wabaId?: undefined;
        qualityRating?: undefined;
    } | {
        connected: boolean;
        mode: string;
        phoneNumber: string;
        wabaId: string;
        qualityRating: string;
    }>;
    getPublicConfig(): Promise<{
        appId: string | undefined;
        configId: string | undefined;
    }>;
    disconnect(tenantId: string): Promise<import("typeorm").DeleteResult>;
    sendTestMessage(tenantId: string, to: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
