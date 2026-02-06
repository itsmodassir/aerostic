import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaToken } from './entities/meta-token.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { RedisService } from '../common/redis.service';

@Injectable()
export class MetaService {
    constructor(
        private configService: ConfigService,
        @InjectRepository(MetaToken)
        private metaTokenRepo: Repository<MetaToken>,
        @InjectRepository(WhatsappAccount)
        private whatsappAccountRepo: Repository<WhatsappAccount>,
        @InjectRepository(SystemConfig)
        private configRepo: Repository<SystemConfig>,
        private redisService: RedisService,
    ) { }

    async handleOAuthCallback(code: string, tenantId: string, providedWabaId?: string, providedPhoneNumberId?: string) {
        // Fetch config from DB first
        const dbConfigs = await this.configRepo.find({
            where: [
                { key: 'meta.app_id' },
                { key: 'meta.app_secret' },
                { key: 'meta.redirect_uri' }
            ]
        });

        const appId = dbConfigs.find(c => c.key === 'meta.app_id')?.value || this.configService.get('META_APP_ID') || '';
        const appSecret = dbConfigs.find(c => c.key === 'meta.app_secret')?.value || this.configService.get('META_APP_SECRET') || '';

        // Use the configured redirect URI or fallback to production API endpoint
        let redirectUri = dbConfigs.find(c => c.key === 'meta.redirect_uri')?.value
            || this.configService.get('META_REDIRECT_URI')
            || 'https://api.aerostic.com/meta/callback';

        // Ensure we don't accidentally use localhost in production if not explicitly intended
        if (redirectUri.includes('localhost') && process.env.NODE_ENV === 'production') {
            redirectUri = 'https://api.aerostic.com/meta/callback';
        }

        console.log('--- OAuth Debug (v22.0) ---');
        console.log('App ID:', appId);
        console.log('Redirect URI:', redirectUri);
        console.log('-------------------');

        // 1. Exchange auth code for short-lived access token
        const tokenRes = await axios.get(
            'https://graph.facebook.com/v22.0/oauth/access_token',
            {
                params: {
                    client_id: appId,
                    client_secret: appSecret,
                    redirect_uri: redirectUri,
                    code,
                },
            },
        );

        const shortToken = tokenRes.data.access_token;

        // 2. Exchange short-lived token for long-lived token
        const longTokenData = await this.exchangeForLongLivedToken(shortToken, appId, appSecret);
        const accessToken = longTokenData.access_token;
        const expiresAt = new Date(Date.now() + (longTokenData.expires_in || 5184000) * 1000);

        // 3. Fetch WhatsApp Business Account using the 'Safe' endpoint
        const meRes = await axios.get(
            'https://graph.facebook.com/v22.0/me',
            {
                params: {
                    fields: 'whatsapp_business_accounts',
                    access_token: accessToken,
                },
            }
        );

        const waba = meRes.data.whatsapp_business_accounts?.data?.[0];
        const wabaId = providedWabaId || waba?.id;

        if (!wabaId) {
            console.error('Meta Response (me):', JSON.stringify(meRes.data));
            throw new BadRequestException('No WhatsApp Business Account (WABA) found. Please ensure you selected a WABA in the popup.');
        }

        // 4. Fetch Phone Number
        const phoneRes = await axios.get(
            `https://graph.facebook.com/v22.0/${wabaId}/phone_numbers`,
            {
                params: { access_token: accessToken },
            },
        );

        const numberData = phoneRes.data.data?.[0];
        const phoneNumberId = providedPhoneNumberId || numberData?.id;
        const displayPhoneNumber = numberData?.display_phone_number;

        if (!phoneNumberId) {
            throw new BadRequestException('No Phone Number ID found for this account.');
        }

        // 5. Save Mapping (Upsert) - Storing Token Directly in Account for Multi-Tenancy
        const existing = await this.whatsappAccountRepo.findOneBy({ phoneNumberId });

        if (existing) {
            existing.tenantId = tenantId;
            existing.wabaId = wabaId;
            existing.displayPhoneNumber = displayPhoneNumber;
            existing.accessToken = accessToken;
            existing.tokenExpiresAt = expiresAt;
            existing.status = 'connected';
            await this.whatsappAccountRepo.save(existing);
        } else {
            await this.whatsappAccountRepo.save({
                tenantId,
                wabaId,
                phoneNumberId,
                displayPhoneNumber,
                accessToken,
                tokenExpiresAt: expiresAt,
                mode: 'coexistence',
                status: 'connected',
            });
        }

        // Invalidate Redis Cache for this tenant
        await this.redisService.del(`whatsapp:token:${tenantId}`);

        return { success: true };
    }

    async getTemplates(wabaId: string, accessToken: string) {
        try {
            const url = `https://graph.facebook.com/v22.0/${wabaId}/message_templates`;
            const { data } = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { limit: 100 }
            });
            return data.data;
        } catch (error: any) {
            console.error('Failed to fetch templates from Meta', error.response?.data || error.message);
            return [];
        }
    }

    async exchangeForLongLivedToken(shortToken: string, appId: string, appSecret: string) {
        try {
            const response = await axios.get(
                'https://graph.facebook.com/v22.0/oauth/access_token',
                {
                    params: {
                        grant_type: 'fb_exchange_token',
                        client_id: appId,
                        client_secret: appSecret,
                        fb_exchange_token: shortToken,
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('Failed to exchange long-lived token:', error.response?.data || error.message);
            throw new BadRequestException('Failed to exchange long-lived token');
        }
    }
}
