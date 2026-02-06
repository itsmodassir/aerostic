"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const qs = __importStar(require("querystring"));
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const system_config_entity_1 = require("../admin/entities/system-config.entity");
const whatsapp_account_entity_1 = require("./entities/whatsapp-account.entity");
const redis_service_1 = require("../common/redis.service");
let WhatsappService = class WhatsappService {
    configService;
    configRepo;
    whatsappAccountRepo;
    messageQueue;
    redisService;
    constructor(configService, configRepo, whatsappAccountRepo, messageQueue, redisService) {
        this.configService = configService;
        this.configRepo = configRepo;
        this.whatsappAccountRepo = whatsappAccountRepo;
        this.messageQueue = messageQueue;
        this.redisService = redisService;
    }
    async getEmbeddedSignupUrl(tenantId) {
        const dbConfigs = await this.configRepo.find({
            where: [{ key: 'meta.app_id' }, { key: 'meta.redirect_uri' }],
        });
        const appId = dbConfigs.find((c) => c.key === 'meta.app_id')?.value ||
            this.configService.get('META_APP_ID');
        const redirectUri = 'https://api.aerostic.com/meta/callback';
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
        return `https://www.facebook.com/v22.0/dialog/oauth?${params}`;
    }
    async getCredentials(tenantId) {
        const cacheKey = `whatsapp:token:${tenantId}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const account = await this.whatsappAccountRepo.findOne({
            where: { tenantId },
        });
        if (!account)
            return null;
        const credentials = {
            wabaId: account.wabaId,
            phoneNumberId: account.phoneNumberId,
            accessToken: account.accessToken,
        };
        await this.redisService.set(cacheKey, JSON.stringify(credentials), 3600);
        return credentials;
    }
    async getStatus(tenantId) {
        const account = await this.whatsappAccountRepo.findOne({
            where: { tenantId },
        });
        if (!account)
            return { connected: false };
        return {
            connected: account.status === 'connected',
            mode: account.mode,
            phoneNumber: account.displayPhoneNumber,
            wabaId: account.wabaId,
            qualityRating: account.qualityRating,
        };
    }
    async getPublicConfig() {
        const dbConfigs = await this.configRepo.find({
            where: [{ key: 'meta.app_id' }, { key: 'meta.config_id' }],
        });
        return {
            appId: dbConfigs.find((c) => c.key === 'meta.app_id')?.value ||
                this.configService.get('META_APP_ID'),
            configId: dbConfigs.find((c) => c.key === 'meta.config_id')?.value ||
                this.configService.get('META_CONFIG_ID'),
        };
    }
    async disconnect(tenantId) {
        return this.whatsappAccountRepo.delete({ tenantId });
    }
    async sendTestMessage(tenantId, to) {
        const credentials = await this.getCredentials(tenantId);
        if (!credentials || !credentials.accessToken) {
            throw new common_1.BadRequestException('WhatsApp account not connected for this tenant');
        }
        const payload = {
            messaging_product: 'whatsapp',
            to: to,
            type: 'template',
            template: {
                name: 'hello_world',
                language: {
                    code: 'en_US',
                },
            },
        };
        await this.messageQueue.add('send-test', {
            tenantId,
            to,
            payload,
        }, {
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
        return { success: true, message: 'Message enqueued for delivery' };
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(system_config_entity_1.SystemConfig)),
    __param(2, (0, typeorm_1.InjectRepository)(whatsapp_account_entity_1.WhatsappAccount)),
    __param(3, (0, bullmq_1.InjectQueue)('whatsapp-messages')),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        bullmq_2.Queue,
        redis_service_1.RedisService])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map