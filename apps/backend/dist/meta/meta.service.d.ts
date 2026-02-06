import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { MetaToken } from './entities/meta-token.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { RedisService } from '../common/redis.service';
export declare class MetaService {
    private configService;
    private metaTokenRepo;
    private whatsappAccountRepo;
    private configRepo;
    private redisService;
    constructor(configService: ConfigService, metaTokenRepo: Repository<MetaToken>, whatsappAccountRepo: Repository<WhatsappAccount>, configRepo: Repository<SystemConfig>, redisService: RedisService);
    handleOAuthCallback(code: string, tenantId: string, providedWabaId?: string, providedPhoneNumberId?: string): Promise<{
        success: boolean;
    }>;
    getTemplates(wabaId: string, accessToken: string): Promise<any>;
    exchangeForLongLivedToken(shortToken: string, appId: string, appSecret: string): Promise<any>;
}
