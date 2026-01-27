import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaToken } from './entities/meta-token.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';

@Injectable()
export class MetaService {
    constructor(
        private configService: ConfigService,
        @InjectRepository(MetaToken)
        private metaTokenRepo: Repository<MetaToken>,
        @InjectRepository(WhatsappAccount)
        private whatsappAccountRepo: Repository<WhatsappAccount>,
    ) { }

    async handleOAuthCallback(code: string, tenantId: string) {
        // 1. Exchange auth code for access token
        const tokenRes = await axios.get(
            'https://graph.facebook.com/v18.0/oauth/access_token',
            {
                params: {
                    client_id: this.configService.get('META_APP_ID'),
                    client_secret: this.configService.get('META_APP_SECRET'),
                    redirect_uri: this.configService.get('META_REDIRECT_URI'),
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


        // 2. Fetch Business ID
        const businesses = await axios.get(
            'https://graph.facebook.com/v18.0/me/businesses',
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            },
        );

        const businessId = businesses.data.data?.[0]?.id;
        if (!businessId) throw new Error('No business found');

        // 3. Fetch WABA
        const wabas = await axios.get(
            `https://graph.facebook.com/v18.0/${businessId}/owned_whatsapp_business_accounts`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            },
        );

        const wabaId = wabas.data.data?.[0]?.id;
        if (!wabaId) throw new Error('No WABA found');

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
