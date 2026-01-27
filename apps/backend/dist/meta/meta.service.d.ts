import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { MetaToken } from './entities/meta-token.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
export declare class MetaService {
    private configService;
    private metaTokenRepo;
    private whatsappAccountRepo;
    constructor(configService: ConfigService, metaTokenRepo: Repository<MetaToken>, whatsappAccountRepo: Repository<WhatsappAccount>);
    handleOAuthCallback(code: string, tenantId: string): Promise<{
        success: boolean;
    }>;
    getTemplates(wabaId: string, accessToken: string): Promise<any>;
}
