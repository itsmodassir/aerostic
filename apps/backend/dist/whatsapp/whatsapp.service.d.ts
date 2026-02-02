import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { WhatsappAccount } from './entities/whatsapp-account.entity';
import { MetaToken } from '../meta/entities/meta-token.entity';
export declare class WhatsappService {
    private configService;
    private configRepo;
    private whatsappAccountRepo;
    private metaTokenRepo;
    constructor(configService: ConfigService, configRepo: Repository<SystemConfig>, whatsappAccountRepo: Repository<WhatsappAccount>, metaTokenRepo: Repository<MetaToken>);
    getEmbeddedSignupUrl(tenantId: string): Promise<string>;
    getCredentials(tenantId: string): Promise<{
        wabaId: any;
        accessToken: any;
    }>;
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
    disconnect(tenantId: string): Promise<import("typeorm").DeleteResult>;
    sendTestMessage(tenantId: string, to: string): Promise<{
        success: boolean;
        messageId: any;
    }>;
}
