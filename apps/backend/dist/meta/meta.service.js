"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meta_token_entity_1 = require("./entities/meta-token.entity");
const whatsapp_account_entity_1 = require("../whatsapp/entities/whatsapp-account.entity");
const system_config_entity_1 = require("../admin/entities/system-config.entity");
const redis_service_1 = require("../common/redis.service");
let MetaService = class MetaService {
    configService;
    metaTokenRepo;
    whatsappAccountRepo;
    configRepo;
    redisService;
    constructor(configService, metaTokenRepo, whatsappAccountRepo, configRepo, redisService) {
        this.configService = configService;
        this.metaTokenRepo = metaTokenRepo;
        this.whatsappAccountRepo = whatsappAccountRepo;
        this.configRepo = configRepo;
        this.redisService = redisService;
    }
    async handleOAuthCallback(code, tenantId, providedWabaId, providedPhoneNumberId) {
        const dbConfigs = await this.configRepo.find({
            where: [
                { key: 'meta.app_id' },
                { key: 'meta.app_secret' },
                { key: 'meta.redirect_uri' },
            ],
        });
        const appId = dbConfigs.find((c) => c.key === 'meta.app_id')?.value ||
            this.configService.get('META_APP_ID') ||
            '';
        const appSecret = dbConfigs.find((c) => c.key === 'meta.app_secret')?.value ||
            this.configService.get('META_APP_SECRET') ||
            '';
        let redirectUri = dbConfigs.find((c) => c.key === 'meta.redirect_uri')?.value ||
            this.configService.get('META_REDIRECT_URI') ||
            'https://api.aerostic.com/meta/callback';
        if (redirectUri.includes('localhost') &&
            process.env.NODE_ENV === 'production') {
            redirectUri = 'https://api.aerostic.com/meta/callback';
        }
        console.log('--- OAuth Debug (v22.0) ---');
        console.log('App ID:', appId);
        console.log('Redirect URI:', redirectUri);
        console.log('-------------------');
        const tokenRes = await axios_1.default.get('https://graph.facebook.com/v22.0/oauth/access_token', {
            params: {
                client_id: appId,
                client_secret: appSecret,
                redirect_uri: redirectUri,
                code,
            },
        });
        const shortToken = tokenRes.data.access_token;
        const longTokenData = await this.exchangeForLongLivedToken(shortToken, appId, appSecret);
        const accessToken = longTokenData.access_token;
        const expiresAt = new Date(Date.now() + (longTokenData.expires_in || 5184000) * 1000);
        const meRes = await axios_1.default.get('https://graph.facebook.com/v22.0/me', {
            params: {
                fields: 'whatsapp_business_accounts',
                access_token: accessToken,
            },
        });
        const waba = meRes.data.whatsapp_business_accounts?.data?.[0];
        const wabaId = providedWabaId || waba?.id;
        if (!wabaId) {
            console.error('Meta Response (me):', JSON.stringify(meRes.data));
            throw new common_1.BadRequestException('No WhatsApp Business Account (WABA) found. Please ensure you selected a WABA in the popup.');
        }
        const phoneRes = await axios_1.default.get(`https://graph.facebook.com/v22.0/${wabaId}/phone_numbers`, {
            params: { access_token: accessToken },
        });
        const numberData = phoneRes.data.data?.[0];
        const phoneNumberId = providedPhoneNumberId || numberData?.id;
        const displayPhoneNumber = numberData?.display_phone_number;
        if (!phoneNumberId) {
            throw new common_1.BadRequestException('No Phone Number ID found for this account.');
        }
        const existing = await this.whatsappAccountRepo.findOneBy({
            phoneNumberId,
        });
        if (existing) {
            existing.tenantId = tenantId;
            existing.wabaId = wabaId;
            existing.displayPhoneNumber = displayPhoneNumber;
            existing.accessToken = accessToken;
            existing.tokenExpiresAt = expiresAt;
            existing.status = 'connected';
            await this.whatsappAccountRepo.save(existing);
        }
        else {
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
        await this.redisService.del(`whatsapp:token:${tenantId}`);
        return { success: true };
    }
    async getTemplates(wabaId, accessToken) {
        try {
            const url = `https://graph.facebook.com/v22.0/${wabaId}/message_templates`;
            const { data } = await axios_1.default.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { limit: 100 },
            });
            return data.data;
        }
        catch (error) {
            console.error('Failed to fetch templates from Meta', error.response?.data || error.message);
            return [];
        }
    }
    async exchangeForLongLivedToken(shortToken, appId, appSecret) {
        try {
            const response = await axios_1.default.get('https://graph.facebook.com/v22.0/oauth/access_token', {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: appId,
                    client_secret: appSecret,
                    fb_exchange_token: shortToken,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to exchange long-lived token:', error.response?.data || error.message);
            throw new common_1.BadRequestException('Failed to exchange long-lived token');
        }
    }
};
exports.MetaService = MetaService;
exports.MetaService = MetaService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(meta_token_entity_1.MetaToken)),
    __param(2, (0, typeorm_1.InjectRepository)(whatsapp_account_entity_1.WhatsappAccount)),
    __param(3, (0, typeorm_1.InjectRepository)(system_config_entity_1.SystemConfig)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        redis_service_1.RedisService])
], MetaService);
//# sourceMappingURL=meta.service.js.map