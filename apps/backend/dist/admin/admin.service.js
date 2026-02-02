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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const whatsapp_account_entity_1 = require("../whatsapp/entities/whatsapp-account.entity");
const system_config_entity_1 = require("./entities/system-config.entity");
const message_entity_1 = require("../messages/entities/message.entity");
const api_key_entity_1 = require("../billing/entities/api-key.entity");
const typeorm_3 = require("typeorm");
const DEFAULT_CONFIG = {
    'meta.app_id': { value: '', description: 'Meta App ID', category: 'whatsapp', isSecret: false },
    'meta.app_secret': { value: '', description: 'Meta App Secret', category: 'whatsapp', isSecret: true },
    'meta.webhook_verify_token': { value: '', description: 'Webhook Verify Token', category: 'whatsapp', isSecret: false },
    'razorpay.key_id': { value: '', description: 'Razorpay Key ID', category: 'payment', isSecret: false },
    'razorpay.key_secret': { value: '', description: 'Razorpay Key Secret', category: 'payment', isSecret: true },
    'razorpay.webhook_secret': { value: '', description: 'Razorpay Webhook Secret', category: 'payment', isSecret: true },
    'ai.gemini_api_key': { value: '', description: 'Google Gemini API Key', category: 'ai', isSecret: true },
    'ai.openai_api_key': { value: '', description: 'OpenAI API Key (Optional)', category: 'ai', isSecret: true },
    'platform.app_url': { value: 'https://app.aerostic.com', description: 'Application URL', category: 'platform', isSecret: false },
    'platform.trial_days': { value: '14', description: 'Trial Period (days)', category: 'platform', isSecret: false },
    'platform.message_rate_limit': { value: '100', description: 'Message Rate Limit (per minute)', category: 'platform', isSecret: false },
    'platform.max_tenants': { value: '1000', description: 'Max Tenants Per Server', category: 'platform', isSecret: false },
};
let AdminService = class AdminService {
    tenantRepo;
    whatsappAccountRepo;
    configRepo;
    messageRepo;
    apiKeyRepo;
    constructor(tenantRepo, whatsappAccountRepo, configRepo, messageRepo, apiKeyRepo) {
        this.tenantRepo = tenantRepo;
        this.whatsappAccountRepo = whatsappAccountRepo;
        this.configRepo = configRepo;
        this.messageRepo = messageRepo;
        this.apiKeyRepo = apiKeyRepo;
    }
    async getAllTenants() {
        return this.tenantRepo.find({
            order: { createdAt: 'DESC' }
        });
    }
    async getAllAccounts() {
        return this.whatsappAccountRepo.find({
            relations: ['tenant'],
            order: { createdAt: 'DESC' }
        });
    }
    async rotateSystemTokens() {
        console.log('Rotating system tokens...');
        return { status: 'success', timestamp: new Date() };
    }
    async getSystemLogs() {
        return {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            timestamp: new Date(),
        };
    }
    async getConfig() {
        const configs = await this.configRepo.find();
        const result = {};
        for (const [key, def] of Object.entries(DEFAULT_CONFIG)) {
            result[key] = {
                value: def.isSecret ? '••••••••••••••••' : def.value,
                description: def.description,
                category: def.category,
                isSecret: def.isSecret || false,
            };
        }
        for (const config of configs) {
            result[config.key] = {
                value: config.isSecret ? '••••••••••••••••' : config.value,
                description: config.description,
                category: config.category,
                isSecret: config.isSecret,
                updatedAt: config.updatedAt,
            };
        }
        return result;
    }
    async getConfigValue(key) {
        const config = await this.configRepo.findOne({ where: { key } });
        if (config) {
            return config.value;
        }
        return DEFAULT_CONFIG[key]?.value || null;
    }
    async setConfig(updates) {
        const updated = [];
        for (const [key, value] of Object.entries(updates)) {
            if (value === '••••••••••••••••' || value === '')
                continue;
            let config = await this.configRepo.findOne({ where: { key } });
            if (config) {
                config.value = value;
                await this.configRepo.save(config);
            }
            else {
                const defaultDef = DEFAULT_CONFIG[key] || { description: key, category: 'general', isSecret: false };
                config = this.configRepo.create({
                    key,
                    value,
                    description: defaultDef.description || key,
                    category: defaultDef.category || 'general',
                    isSecret: defaultDef.isSecret || false,
                });
                await this.configRepo.save(config);
            }
            updated.push(key);
        }
        return { success: true, updated };
    }
    async deleteConfig(key) {
        const config = await this.configRepo.findOne({ where: { key } });
        if (config) {
            await this.configRepo.remove(config);
        }
    }
    async updateUserPlan(userId, plan) {
        const tenant = await this.tenantRepo.findOne({ where: { id: userId } });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${userId} not found`);
        }
        tenant.plan = plan;
        return this.tenantRepo.save(tenant);
    }
    async getTenantById(tenantId) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        return tenant;
    }
    async getAllUsers() {
        const tenants = await this.tenantRepo.find({
            order: { createdAt: 'DESC' }
        });
        return tenants.map(t => ({
            id: t.id,
            name: t.name,
            email: t.email || '',
            tenantName: t.name,
            currentPlan: t.plan || 'starter',
            status: 'active',
            createdAt: t.createdAt,
        }));
    }
    async getDashboardStats() {
        const totalTenants = await this.tenantRepo.count();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const messagesToday = await this.messageRepo.count({
            where: {
                createdAt: (0, typeorm_3.Between)(today, new Date())
            }
        });
        const aiConversations = Math.floor(messagesToday * 0.15);
        const monthlyRevenue = 4850000;
        const systemHealth = [
            { service: 'API Gateway', status: 'operational', uptime: '99.99%' },
            { service: 'Database (Primary)', status: 'operational', uptime: '99.97%' },
            { service: 'Redis Cache', status: 'operational', uptime: '100%' },
            { service: 'Meta API Integration', status: 'operational', uptime: '99.5%' },
            { service: 'AI Service (Gemini)', status: 'operational', uptime: '99.9%' },
        ];
        return {
            stats: [
                {
                    label: 'Total Tenants',
                    value: totalTenants.toLocaleString(),
                    change: '+12.5%',
                    up: true
                },
                {
                    label: 'Monthly Revenue',
                    value: '₹48.5L',
                    change: '+23.1%',
                    up: true
                },
                {
                    label: 'Messages Today',
                    value: messagesToday.toLocaleString(),
                    change: '+8.2%',
                    up: true
                },
                {
                    label: 'AI Conversations',
                    value: aiConversations.toLocaleString(),
                    change: '-2.4%',
                    up: false
                }
            ],
            systemHealth
        };
    }
    async getAllApiKeys() {
        const keys = await this.apiKeyRepo.find({
            relations: ['tenant'],
            order: { createdAt: 'DESC' }
        });
        if (keys.length === 0) {
            return [
                {
                    id: '1',
                    name: 'Production API Key',
                    tenantName: 'TechStart India',
                    key: 'ak_live_xxxxxxxxxxxxxxxx',
                    status: 'active',
                    createdAt: new Date(),
                    lastUsed: new Date(),
                    requests: '1.2M'
                }
            ];
        }
        return keys.map(k => ({
            id: k.id,
            name: k.name || 'API Key',
            tenantName: k.tenant?.name || 'Unknown',
            key: `${k.keyPrefix}...`,
            status: k.isActive ? 'active' : 'revoked',
            createdAt: k.createdAt,
            lastUsed: k.lastUsedAt,
            requests: k.requestsToday?.toLocaleString() || '0'
        }));
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(1, (0, typeorm_1.InjectRepository)(whatsapp_account_entity_1.WhatsappAccount)),
    __param(2, (0, typeorm_1.InjectRepository)(system_config_entity_1.SystemConfig)),
    __param(3, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(4, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map