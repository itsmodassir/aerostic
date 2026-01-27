import { Injectable } from '@nestjs/common';
import * as qs from 'querystring';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappService {
    constructor(private configService: ConfigService) { }

    getEmbeddedSignupUrl(tenantId: string) {
        const params = qs.stringify({
            client_id: this.configService.get('META_APP_ID'),
            redirect_uri: this.configService.get('META_REDIRECT_URI'),
            scope: [
                'whatsapp_business_management',
                'whatsapp_business_messaging',
                'business_management',
            ].join(','),
            response_type: 'code',
            state: tenantId,
        });

        return `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
    }
    async getCredentials(tenantId: string) {
        // TODO: In a real implementation, you would look up the SystemUser access token 
        // linked to this tenant in the DB (e.g. `whatsapp_configs` table).
        // For this MVP, we will assume environment variables OR a hardcoded token for the demo tenant.

        // If we want to test with real data, we need the stored token from the OAuth callback.
        // Since we haven't implemented persistent token storage linked to tenant yet (only exchange logic),
        // we'll return null or look for a specific ENV.
        return {
            wabaId: this.configService.get('TEST_WABA_ID'),
            accessToken: this.configService.get('TEST_ACCESS_TOKEN')
        };
    }
}
