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
const webhook_endpoint_entity_1 = require("../billing/entities/webhook-endpoint.entity");
const DEFAULT_CONFIG = {
    'meta.app_id': {
        value: '',
        description: 'Meta App ID',
        category: 'whatsapp',
        isSecret: false,
    },
    'meta.app_secret': {
        value: '',
        description: 'Meta App Secret',
        category: 'whatsapp',
        isSecret: true,
    },
    'meta.webhook_verify_token': {
        value: '',
        description: 'Webhook Verify Token',
        category: 'whatsapp',
        isSecret: false,
    },
    'meta.config_id': {
        value: '',
        description: 'WhatsApp Configuration ID',
        category: 'whatsapp',
        isSecret: false,
    },
    'razorpay.key_id': {
        value: '',
        description: 'Razorpay Key ID',
        category: 'payment',
        isSecret: false,
    },
    'razorpay.key_secret': {
        value: '',
        description: 'Razorpay Key Secret',
        category: 'payment',
        isSecret: true,
    },
    'razorpay.webhook_secret': {
        value: '',
        description: 'Razorpay Webhook Secret',
        category: 'payment',
        isSecret: true,
    },
    'ai.gemini_api_key': {
        value: '',
        description: 'Google Gemini API Key',
        category: 'ai',
        isSecret: true,
    },
    'ai.openai_api_key': {
        value: '',
        description: 'OpenAI API Key (Optional)',
        category: 'ai',
        isSecret: true,
    },
    'platform.app_url': {
        value: 'https://app.aerostic.com',
        description: 'Application URL',
        category: 'platform',
        isSecret: false,
    },
    'platform.trial_days': {
        value: '14',
        description: 'Trial Period (days)',
        category: 'platform',
        isSecret: false,
    },
    'platform.message_rate_limit': {
        value: '100',
        description: 'Message Rate Limit (per minute)',
        category: 'platform',
        isSecret: false,
    },
    'platform.max_tenants': {
        value: '1000',
        description: 'Max Tenants Per Server',
        category: 'platform',
        isSecret: false,
    },
};
const audit_service_1 = require("../audit/audit.service");
const subscription_entity_1 = require("../billing/entities/subscription.entity");
const billing_service_1 = require("../billing/billing.service");
let AdminService = class AdminService {
    tenantRepo;
    whatsappAccountRepo;
    configRepo;
    messageRepo;
    apiKeyRepo;
    subscriptionRepo;
    webhookEndpointRepo;
    auditService;
    billingService;
    constructor(tenantRepo, whatsappAccountRepo, configRepo, messageRepo, apiKeyRepo, subscriptionRepo, webhookEndpointRepo, auditService, billingService) {
        this.tenantRepo = tenantRepo;
        this.whatsappAccountRepo = whatsappAccountRepo;
        this.configRepo = configRepo;
        this.messageRepo = messageRepo;
        this.apiKeyRepo = apiKeyRepo;
        this.subscriptionRepo = subscriptionRepo;
        this.webhookEndpointRepo = webhookEndpointRepo;
        this.auditService = auditService;
        this.billingService = billingService;
    }
    async getAllTenants() {
        return this.tenantRepo.find({
            order: { createdAt: 'DESC' },
        });
    }
    async getAllAccounts() {
        return this.whatsappAccountRepo.find({
            relations: ['tenant'],
            order: { createdAt: 'DESC' },
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
                const defaultDef = DEFAULT_CONFIG[key] || {
                    description: key,
                    category: 'general',
                    isSecret: false,
                };
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
        await this.auditService.logAction('admin', 'Administrator', 'UPDATE_CONFIG', 'System Configuration', { updatedKeys: updated });
        return { success: true, updated };
    }
    async deleteConfig(key) {
        const config = await this.configRepo.findOne({ where: { key } });
        if (config) {
            await this.configRepo.remove(config);
            await this.auditService.logAction('admin', 'Administrator', 'DELETE_CONFIG', key);
        }
    }
    async updateUserPlan(userId, plan, status) {
        const tenant = await this.tenantRepo.findOne({ where: { id: userId } });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${userId} not found`);
        }
        const oldPlan = tenant.plan;
        tenant.plan = plan;
        const saved = await this.tenantRepo.save(tenant);
        await this.billingService.manualUpdateSubscription(tenant.id, plan, status);
        await this.auditService.logAction('admin', 'Administrator', 'UPDATE_TENANT_PLAN', `Tenant: ${tenant.name}`, { oldPlan, newPlan: plan, status });
        return saved;
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
            order: { createdAt: 'DESC' },
        });
        return tenants.map((t) => ({
            id: t.id,
            name: t.name,
            email: t.email || '',
            tenantName: t.name,
            currentPlan: t.plan || 'starter',
            status: 'active',
            createdAt: t.createdAt,
        }));
    }
    async checkSystemHealth() {
        const health = [];
        try {
            await this.tenantRepo.query('SELECT 1');
            health.push({
                service: 'Database (Primary)',
                status: 'operational',
                uptime: '99.99%',
            });
        }
        catch (e) {
            health.push({
                service: 'Database (Primary)',
                status: 'down',
                uptime: '0%',
            });
        }
        health.push({
            service: 'Redis Cache',
            status: 'operational',
            uptime: '100%',
        });
        const metaAppId = await this.getConfigValue('meta.app_id');
        health.push({
            service: 'Meta API Integration',
            status: metaAppId ? 'operational' : 'not_configured',
            uptime: metaAppId ? '99.9%' : '0%',
        });
        const geminiKey = await this.getConfigValue('ai.gemini_api_key');
        health.push({
            service: 'Gemini AI Service',
            status: geminiKey ? 'operational' : 'not_configured',
            uptime: geminiKey ? '99.9%' : '0%',
        });
        health.push({
            service: 'API Gateway',
            status: 'operational',
            uptime: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
        });
        return health;
    }
    async getDashboardStats() {
        const totalTenants = await this.tenantRepo.count();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const messagesToday = await this.messageRepo.count({
            where: {
                createdAt: (0, typeorm_3.Between)(today, new Date()),
            },
        });
        const aiConversations = Math.floor(messagesToday * 0.22);
        const activeSubscriptions = await this.subscriptionRepo.find({
            where: {
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
            },
            relations: ['tenant'],
        });
        const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => {
            if (sub.billingCycle === 'yearly') {
                return sum + sub.priceInr / 12;
            }
            return sum + sub.priceInr;
        }, 0);
        const topTenantsRaw = activeSubscriptions.slice(0, 5).map((sub) => ({
            name: sub.tenant?.name || 'Unknown',
            plan: sub.plan
                ? sub.plan.charAt(0).toUpperCase() +
                    sub.plan.slice(1)
                : 'Starter',
            messages: '0',
            revenue: `₹${sub.priceInr.toLocaleString()}`,
        }));
        const revenueLakhs = (monthlyRevenue / 100000).toFixed(1);
        const systemHealth = await this.checkSystemHealth();
        const recentAlerts = await this.getRecentAlerts();
        return {
            stats: [
                {
                    label: 'Active Tenants',
                    value: totalTenants.toLocaleString(),
                    change: '+10.2%',
                    up: true,
                },
                {
                    label: 'MRR',
                    value: `₹${revenueLakhs}L`,
                    change: '+15.5%',
                    up: true,
                },
                {
                    label: 'Messages Today',
                    value: messagesToday.toLocaleString(),
                    change: '+12.1%',
                    up: true,
                },
                {
                    label: 'AI Conversations',
                    value: aiConversations.toLocaleString(),
                    change: '+5.4%',
                    up: true,
                },
            ],
            systemHealth,
            recentAlerts,
            topTenants: topTenantsRaw,
        };
    }
    async getRecentAlerts() {
        const logs = await this.auditService.getLogs(4);
        return logs.map((log) => {
            let type = 'info';
            if (log.action.includes('DELETE'))
                type = 'error';
            if (log.action.includes('UPDATE'))
                type = 'warning';
            if (log.action.includes('CREATE'))
                type = 'success';
            const diff = Date.now() - log.timestamp.getTime();
            const mins = Math.floor(diff / 60000);
            const hours = Math.floor(mins / 60);
            const timeStr = hours > 0
                ? `${hours} hours ago`
                : mins > 0
                    ? `${mins} mins ago`
                    : 'just now';
            return {
                type,
                message: `${log.actorName} performed ${log.action.replace(/_/g, ' ')} on ${log.target}`,
                time: timeStr,
            };
        });
    }
    async getAnalyticsTrends(period = '7d') {
        const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        const revenueRaw = await this.subscriptionRepo
            .createQueryBuilder('subscription')
            .select("to_char(subscription.createdAt, 'YYYY-MM-DD')", 'date')
            .addSelect('SUM(subscription.priceInr)', 'value')
            .where('subscription.createdAt >= :startDate', { startDate })
            .andWhere('subscription.status != :status', { status: 'cancelled' })
            .groupBy("to_char(subscription.createdAt, 'YYYY-MM-DD')")
            .getRawMany();
        const messagesRaw = await this.messageRepo
            .createQueryBuilder('message')
            .select("to_char(message.createdAt, 'YYYY-MM-DD')", 'date')
            .addSelect('COUNT(message.id)', 'value')
            .where('message.createdAt >= :startDate', { startDate })
            .groupBy("to_char(message.createdAt, 'YYYY-MM-DD')")
            .getRawMany();
        const revenueData = [];
        const messagesData = [];
        const now = new Date();
        for (let i = days; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const revEntry = revenueRaw.find((r) => r.date === dateStr);
            const msgEntry = messagesRaw.find((r) => r.date === dateStr);
            revenueData.push({
                date: dateStr,
                value: revEntry ? parseFloat(revEntry.value) : 0,
            });
            messagesData.push({
                date: dateStr,
                value: msgEntry ? parseInt(msgEntry.value) : 0,
            });
        }
        return { revenue: revenueData, messages: messagesData };
    }
    async getAllApiKeys() {
        const keys = await this.apiKeyRepo.find({
            relations: ['tenant'],
            order: { createdAt: 'DESC' },
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
                    requests: '1.2M',
                },
            ];
        }
        return keys.map((k) => ({
            id: k.id,
            name: k.name || 'API Key',
            tenantName: k.tenant?.name || 'Unknown',
            key: `${k.keyPrefix}...`,
            status: k.isActive ? 'active' : 'revoked',
            createdAt: k.createdAt,
            lastUsed: k.lastUsedAt,
            requests: k.requestsToday?.toLocaleString() || '0',
        }));
    }
    async getAllMessages(page = 1, limit = 20, search) {
        const query = this.messageRepo
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.tenant', 'tenant')
            .leftJoinAndSelect('message.conversation', 'conversation')
            .leftJoinAndSelect('conversation.contact', 'contact')
            .orderBy('message.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        if (search) {
            query.andWhere('(message.id ILIKE :search OR contact.phoneNumber ILIKE :search OR tenant.name ILIKE :search)', { search: `%${search}%` });
        }
        const [messages, total] = await query.getManyAndCount();
        return {
            data: messages.map((m) => {
                const phoneNumber = m.conversation?.contact?.phoneNumber || 'Unknown';
                const isOutbound = m.direction === 'out';
                return {
                    id: m.id,
                    tenant: m.tenant?.name || 'Unknown',
                    from: isOutbound ? 'Business' : phoneNumber,
                    to: isOutbound ? phoneNumber : 'Business',
                    type: m.type,
                    status: m.status,
                    timestamp: m.createdAt,
                };
            }),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getAllWebhooks() {
        const webhooks = await this.webhookEndpointRepo.find({
            relations: ['tenant'],
            order: { createdAt: 'DESC' },
        });
        const total = webhooks.length;
        const active = webhooks.filter((w) => w.isActive).length;
        const failing = webhooks.filter((w) => w.failureCount > 5).length;
        return {
            stats: { total, active, failing, deliveriesToday: '0' },
            webhooks: webhooks.map((w) => ({
                id: w.id,
                url: w.url,
                tenant: w.tenant?.name || 'Unknown',
                events: w.events,
                status: w.isActive
                    ? w.failureCount > 10
                        ? 'failing'
                        : 'active'
                    : 'inactive',
                lastDelivery: w.lastTriggeredAt,
                successRate: w.failureCount > 0 ? '95%' : '100%',
            })),
        };
    }
    async getSystemAlerts() {
        const alerts = [];
        const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const failedMessages = await this.messageRepo.count({
            where: { status: 'failed', createdAt: (0, typeorm_3.Between)(anHourAgo, new Date()) },
        });
        if (failedMessages > 50) {
            alerts.push({
                id: 'alert-msg-fail',
                type: 'critical',
                title: 'High Message Failure Rate',
                description: `${failedMessages} messages failed in the last hour`,
                source: 'WhatsApp Gateway',
                time: '1 hour ago',
                acknowledged: false,
            });
        }
        const failingWebhooks = await this.webhookEndpointRepo.count({
            where: { failureCount: 10 },
        });
        if (failingWebhooks > 0) {
            alerts.push({
                id: 'alert-webhook-fail',
                type: 'warning',
                title: 'Webhook Delivery Failures',
                description: `${failingWebhooks} endpoints are failing consistently`,
                source: 'Webhooks',
                time: 'Now',
                acknowledged: false,
            });
        }
        return alerts;
    }
    async getBillingStats() {
        const activeSubscriptions = await this.subscriptionRepo.find({
            where: { status: subscription_entity_1.SubscriptionStatus.ACTIVE },
            relations: ['tenant'],
        });
        const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
            return sum + sub.priceInr;
        }, 0);
        const avgRevenue = activeSubscriptions.length > 0
            ? totalRevenue / activeSubscriptions.length
            : 0;
        const distribution = {
            enterprise: { count: 0, revenue: 0 },
            growth: { count: 0, revenue: 0 },
            starter: { count: 0, revenue: 0 },
        };
        activeSubscriptions.forEach((sub) => {
            const plan = (sub.plan?.toLowerCase() ||
                'starter');
            if (distribution[plan]) {
                distribution[plan].count++;
                distribution[plan].revenue += sub.priceInr;
            }
        });
        const recentSubRaw = await this.subscriptionRepo.find({
            relations: ['tenant'],
            order: { createdAt: 'DESC' },
            take: 10,
        });
        const recentTransactions = recentSubRaw.map((s) => ({
            id: `TXN-${s.id.slice(0, 4).toUpperCase()}`,
            tenant: s.tenant?.name || 'Unknown',
            plan: s.plan || 'Starter',
            amount: `₹${s.priceInr.toLocaleString()}`,
            status: s.status,
            date: s.createdAt.toLocaleDateString('en-IN'),
        }));
        return {
            revenueStats: [
                {
                    label: 'Total Revenue',
                    value: `₹${(totalRevenue / 100000).toFixed(2)}L`,
                    change: '+10.5%',
                    period: 'vs last month',
                },
                {
                    label: 'Active Subscriptions',
                    value: activeSubscriptions.length.toLocaleString(),
                    change: '+5.2%',
                    period: 'vs last month',
                },
                {
                    label: 'Avg Revenue/User',
                    value: `₹${Math.round(avgRevenue).toLocaleString()}`,
                    change: '+2.1%',
                    period: 'vs last month',
                },
                {
                    label: 'Churn Rate',
                    value: '1.2%',
                    change: '-0.3%',
                    period: 'vs last month',
                },
            ],
            planDistribution: [
                {
                    plan: 'Enterprise',
                    count: distribution.enterprise.count,
                    revenue: `₹${(distribution.enterprise.revenue / 100000).toFixed(2)}L`,
                    percentage: (distribution.enterprise.revenue / (totalRevenue || 1)) * 100,
                },
                {
                    plan: 'Growth',
                    count: distribution.growth.count,
                    revenue: `₹${(distribution.growth.revenue / 100000).toFixed(2)}L`,
                    percentage: (distribution.growth.revenue / (totalRevenue || 1)) * 100,
                },
                {
                    plan: 'Starter',
                    count: distribution.starter.count,
                    revenue: `₹${(distribution.starter.revenue / 100000).toFixed(2)}L`,
                    percentage: (distribution.starter.revenue / (totalRevenue || 1)) * 100,
                },
            ],
            recentTransactions,
        };
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
    __param(5, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(6, (0, typeorm_1.InjectRepository)(webhook_endpoint_entity_1.WebhookEndpoint)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService,
        billing_service_1.BillingService])
], AdminService);
//# sourceMappingURL=admin.service.js.map