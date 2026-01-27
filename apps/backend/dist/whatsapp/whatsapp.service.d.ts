import { ConfigService } from '@nestjs/config';
export declare class WhatsappService {
    private configService;
    constructor(configService: ConfigService);
    getEmbeddedSignupUrl(tenantId: string): string;
    getCredentials(tenantId: string): Promise<{
        wabaId: any;
        accessToken: any;
    }>;
}
