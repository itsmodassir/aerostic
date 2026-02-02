import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { MetaToken } from './entities/meta-token.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { SystemConfig } from '../admin/entities/system-config.entity';
export declare class MetaService {
    private configService;
    private metaTokenRepo;
    private whatsappAccountRepo;
    private configRepo;
    constructor(configService: ConfigService, metaTokenRepo: Repository<MetaToken>, whatsappAccountRepo: Repository<WhatsappAccount>, configRepo: Repository<SystemConfig>);
    handleOAuthCallback(code: string, tenantId: string): Promise<{
        success: boolean;
    }>;
    getTemplates(wabaId: string, accessToken: string): Promise<any>;
}
