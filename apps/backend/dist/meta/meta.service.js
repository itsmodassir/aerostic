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
let MetaService = class MetaService {
    configService;
    metaTokenRepo;
    whatsappAccountRepo;
    constructor(configService, metaTokenRepo, whatsappAccountRepo) {
        this.configService = configService;
        this.metaTokenRepo = metaTokenRepo;
        this.whatsappAccountRepo = whatsappAccountRepo;
    }
    async handleOAuthCallback(code, tenantId) {
        const tokenRes = await axios_1.default.get('https://graph.facebook.com/v18.0/oauth/access_token', {
            params: {
                client_id: this.configService.get('META_APP_ID'),
                client_secret: this.configService.get('META_APP_SECRET'),
                redirect_uri: this.configService.get('META_REDIRECT_URI'),
                code,
            },
        });
        const accessToken = tokenRes.data.access_token;
        await this.metaTokenRepo.save({
            tokenType: 'system',
            encryptedToken: accessToken,
            expiresAt: new Date(Date.now() + tokenRes.data.expires_in * 1000),
        });
        const businesses = await axios_1.default.get('https://graph.facebook.com/v18.0/me/businesses', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const businessId = businesses.data.data?.[0]?.id;
        if (!businessId)
            throw new Error('No business found');
        const wabas = await axios_1.default.get(`https://graph.facebook.com/v18.0/${businessId}/owned_whatsapp_business_accounts`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const wabaId = wabas.data.data?.[0]?.id;
        if (!wabaId)
            throw new Error('No WABA found');
        const numbers = await axios_1.default.get(`https://graph.facebook.com/v18.0/${wabaId}/phone_numbers`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const phoneNumberId = numbers.data.data?.[0]?.id;
        const displayPhoneNumber = numbers.data.data?.[0]?.display_phone_number;
        const existing = await this.whatsappAccountRepo.findOneBy({ phoneNumberId });
        if (existing) {
            existing.tenantId = tenantId;
            existing.wabaId = wabaId;
            existing.displayPhoneNumber = displayPhoneNumber;
            existing.status = 'connected';
            await this.whatsappAccountRepo.save(existing);
        }
        else {
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
    async getTemplates(wabaId, accessToken) {
        try {
            const url = `https://graph.facebook.com/v18.0/${wabaId}/message_templates`;
            const { data } = await axios_1.default.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { limit: 100 }
            });
            return data.data;
        }
        catch (error) {
            console.error('Failed to fetch templates from Meta', error.response?.data || error.message);
            return [];
        }
    }
};
exports.MetaService = MetaService;
exports.MetaService = MetaService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(meta_token_entity_1.MetaToken)),
    __param(2, (0, typeorm_1.InjectRepository)(whatsapp_account_entity_1.WhatsappAccount)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MetaService);
//# sourceMappingURL=meta.service.js.map