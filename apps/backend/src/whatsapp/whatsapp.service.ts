import { Injectable, BadRequestException } from '@nestjs/common';
import * as qs from 'querystring';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { WhatsappAccount } from './entities/whatsapp-account.entity';
import { MetaToken } from '../meta/entities/meta-token.entity';

@Injectable()
export class WhatsappService {
    constructor(
        private configService: ConfigService,
        @InjectRepository(SystemConfig)
        private configRepo: Repository<SystemConfig>,
        @InjectRepository(WhatsappAccount)
        private whatsappAccountRepo: Repository<WhatsappAccount>,
        @InjectRepository(MetaToken)
        private metaTokenRepo: Repository<MetaToken>,
    ) { }

    async getEmbeddedSignupUrl(tenantId: string) {
        // Fetch config from DB first, fallback to env
        const dbConfigs = await this.configRepo.find({
            where: [
                { key: 'meta.app_id' },
                { key: 'meta.redirect_uri' }
            ]
        });

        const appId = dbConfigs.find(c => c.key === 'meta.app_id')?.value || this.configService.get('META_APP_ID');
        const redirectUri = 'http://localhost:3000/meta/callback'; // Configurable later

        console.log('Generating OAuth URL with AppID:', appId);

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

    async getStatus(tenantId: string) {
        const account = await this.whatsappAccountRepo.findOne({ where: { tenantId } });
        if (!account) return { connected: false };

        return {
            connected: account.status === 'connected',
            mode: account.mode,
            phoneNumber: account.displayPhoneNumber,
            wabaId: account.wabaId,
            qualityRating: account.qualityRating
        };
    }

    async disconnect(tenantId: string) {
        return this.whatsappAccountRepo.delete({ tenantId });
    }

    async sendTestMessage(tenantId: string, to: string) {
        const account = await this.whatsappAccountRepo.findOne({ where: { tenantId } });
        if (!account || account.status !== 'connected') {
            throw new BadRequestException('WhatsApp account not connected for this tenant');
        }

        // Fetch latest system token
        const token = await this.metaTokenRepo.findOne({
            where: { tokenType: 'system' },
            order: { createdAt: 'DESC' }
        });

        if (!token) {
            throw new BadRequestException('No active Access Token found. Please reconnect.');
        }

        try {
            const url = `https://graph.facebook.com/v18.0/${account.phoneNumberId}/messages`;
            const payload = {
                messaging_product: 'whatsapp',
                to: to,
                type: 'template',
                template: {
                    name: 'hello_world',
                    language: {
                        code: 'en_US'
                    }
                }
            };

            const { data } = await axios.post(url, payload, {
                headers: {
                    'Authorization': `Bearer ${token.encryptedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Meta API Response:', JSON.stringify(data, null, 2));

            return { success: true, messageId: data.messages?.[0]?.id };
        } catch (error: any) {
            console.error('Send message failed:', error.response?.data || error.message);
            throw new BadRequestException('Failed to send test message: ' + (error.response?.data?.error?.message || error.message));
        }
    }
}
