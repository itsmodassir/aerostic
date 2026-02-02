import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaToken } from './entities/meta-token.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { SystemConfig } from '../admin/entities/system-config.entity';

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
    ) { }

    async handleOAuthCallback(code: string, tenantId: string) {
        // Fetch config from DB first
        const dbConfigs = await this.configRepo.find({
            where: [
                { key: 'meta.app_id' },
                { key: 'meta.app_secret' },
                { key: 'meta.redirect_uri' }
            ]
        });

        const appId = dbConfigs.find(c => c.key === 'meta.app_id')?.value || this.configService.get('META_APP_ID');
        const appSecret = dbConfigs.find(c => c.key === 'meta.app_secret')?.value || this.configService.get('META_APP_SECRET');
        const redirectUri = 'http://localhost:3000/meta/callback'; // Always enforce backend redirect

        // 1. Exchange auth code for access token
        const tokenRes = await axios.get(
            'https://graph.facebook.com/v18.0/oauth/access_token',
            {
                params: {
                    client_id: appId,
                    client_secret: appSecret,
                    redirect_uri: redirectUri,
                    code,
                },
            },
        );

        const accessToken = tokenRes.data.access_token;
        // Store System Token
        // In real app: Encrypt!
        await this.metaTokenRepo.save({
            tokenType: 'system',
            encryptedToken: accessToken,
            expiresAt: new Date(Date.now() + tokenRes.data.expires_in * 1000),
        });


        // 2. Fetch Business ID (Optional but recommended)
        let businessId = null;
        try {
            const businesses = await axios.get(
                'https://graph.facebook.com/v18.0/me/businesses',
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                },
            );
            businessId = businesses.data.data?.[0]?.id;
        } catch (e: any) {
            console.warn('Could not fetch Business ID (likely permission issue), attempting to fetch WABAs directly...');
        }

        // 3. Fetch WABA (Try owned first, then client)
        // If businessId is missing, we can try `me/owned_whatsapp_business_accounts` if supported,
        // but typically we need businessId.
        // However, some tokens allow `me/accounts`. Let's stick to business path if available, or try `me` endpoints as fallback.

        // Actually, without business_management, we might not get business ID, but `whatsapp_business_management`
        // might allow us to list WABAs via `me/`.

        let wabas;
        try {
            const endpoint = businessId
                ? `https://graph.facebook.com/v18.0/${businessId}/owned_whatsapp_business_accounts`
                : `https://graph.facebook.com/v18.0/me/owned_whatsapp_business_accounts`; // Fallback attempt

            wabas = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
        } catch (error) {
            // Try client WABAs if owned failed
            const endpoint = businessId
                ? `https://graph.facebook.com/v18.0/${businessId}/client_whatsapp_business_accounts`
                : `https://graph.facebook.com/v18.0/me/client_whatsapp_business_accounts`;

            wabas = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
        }

        let wabaId = wabas.data.data?.[0]?.id;

        // Note: The previous catch block already attempts client WABAs if owned fails.
        // But if owned succeeded but returned empty list, we enter here.
        if (!wabaId) {
            console.log('No owned WABA found in primary attempt, checking client WABAs explicitly...');
            try {
                const endpoint = businessId
                    ? `https://graph.facebook.com/v18.0/${businessId}/client_whatsapp_business_accounts`
                    : `https://graph.facebook.com/v18.0/me/client_whatsapp_business_accounts`;

                wabas = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                wabaId = wabas.data.data?.[0]?.id;
            } catch (e) {
                console.warn('Client WABA fetch also failed');
            }
        }

        if (!wabaId) {
            console.error('Meta Response (WABAs):', JSON.stringify(wabas?.data || {}));
            throw new BadRequestException('No WhatsApp Business Account (WABA) found. Ensure you selected a WABA in the popup.');
        }

        // 4. Fetch Phone Number
        const numbers = await axios.get(
            `https://graph.facebook.com/v18.0/${wabaId}/phone_numbers`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            },
        );

        const phoneNumberId = numbers.data.data?.[0]?.id;
        const displayPhoneNumber = numbers.data.data?.[0]?.display_phone_number;

        // 5. Save Mapping (Upsert)
        const existing = await this.whatsappAccountRepo.findOneBy({ phoneNumberId });

        if (existing) {
            // Update existing
            existing.tenantId = tenantId;
            existing.wabaId = wabaId;
            existing.displayPhoneNumber = displayPhoneNumber;
            existing.status = 'connected';
            await this.whatsappAccountRepo.save(existing);
        } else {
            // Create new
            await this.whatsappAccountRepo.save({
                tenantId,
                wabaId,
                phoneNumberId,
                displayPhoneNumber,
                mode: 'coexistence',
                status: 'connected',
            });
        }

        return { success: true };
    }
    async getTemplates(wabaId: string, accessToken: string) {
        try {
            const url = `https://graph.facebook.com/v18.0/${wabaId}/message_templates`;
            // Note: In real app, we need to handle pagination.
            const { data } = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { limit: 100 }
            });
            return data.data; // Array of templates
        } catch (error: any) {
            console.error('Failed to fetch templates from Meta', error.response?.data || error.message);
            // Don't crash, return empty array so sync doesn't fail completely
            return [];
        }
    }
}
