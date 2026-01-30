import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { SystemConfig } from './entities/system-config.entity';

// Default configuration values with explicit typing
interface ConfigDef {
    value: string;
    description: string;
    category: string;
    isSecret?: boolean;
}

const DEFAULT_CONFIG: Record<string, ConfigDef> = {
    // Meta WhatsApp
    'meta.app_id': { value: '', description: 'Meta App ID', category: 'whatsapp', isSecret: false },
    'meta.app_secret': { value: '', description: 'Meta App Secret', category: 'whatsapp', isSecret: true },
    'meta.webhook_verify_token': { value: '', description: 'Webhook Verify Token', category: 'whatsapp', isSecret: false },

    // Razorpay
    'razorpay.key_id': { value: '', description: 'Razorpay Key ID', category: 'payment', isSecret: false },
    'razorpay.key_secret': { value: '', description: 'Razorpay Key Secret', category: 'payment', isSecret: true },
    'razorpay.webhook_secret': { value: '', description: 'Razorpay Webhook Secret', category: 'payment', isSecret: true },

    // AI
    'ai.gemini_api_key': { value: '', description: 'Google Gemini API Key', category: 'ai', isSecret: true },
    'ai.openai_api_key': { value: '', description: 'OpenAI API Key (Optional)', category: 'ai', isSecret: true },

    // Platform
    'platform.app_url': { value: 'https://app.aerostic.com', description: 'Application URL', category: 'platform', isSecret: false },
    'platform.trial_days': { value: '14', description: 'Trial Period (days)', category: 'platform', isSecret: false },
    'platform.message_rate_limit': { value: '100', description: 'Message Rate Limit (per minute)', category: 'platform', isSecret: false },
    'platform.max_tenants': { value: '1000', description: 'Max Tenants Per Server', category: 'platform', isSecret: false },
};

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Tenant)
        private tenantRepo: Repository<Tenant>,
        @InjectRepository(WhatsappAccount)
        private whatsappAccountRepo: Repository<WhatsappAccount>,
        @InjectRepository(SystemConfig)
        private configRepo: Repository<SystemConfig>,
    ) { }

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

    // System Configuration Methods
    async getConfig(): Promise<Record<string, any>> {
        const configs = await this.configRepo.find();
        const result: Record<string, any> = {};

        // Start with defaults
        for (const [key, def] of Object.entries(DEFAULT_CONFIG)) {
            result[key] = {
                value: def.isSecret ? '••••••••••••••••' : def.value,
                description: def.description,
                category: def.category,
                isSecret: def.isSecret || false,
            };
        }

        // Override with stored values
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

    async getConfigValue(key: string): Promise<string | null> {
        const config = await this.configRepo.findOne({ where: { key } });
        if (config) {
            return config.value;
        }
        return DEFAULT_CONFIG[key]?.value || null;
    }

    async setConfig(updates: Record<string, string>): Promise<{ success: boolean; updated: string[] }> {
        const updated: string[] = [];

        for (const [key, value] of Object.entries(updates)) {
            // Skip masked values (user didn't change them)
            if (value === '••••••••••••••••' || value === '') continue;

            let config = await this.configRepo.findOne({ where: { key } });

            if (config) {
                config.value = value;
                await this.configRepo.save(config);
            } else {
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

    async deleteConfig(key: string): Promise<void> {
        const config = await this.configRepo.findOne({ where: { key } });
        if (config) {
            await this.configRepo.remove(config);
        }
    }

    // User plan management
    async updateUserPlan(userId: string, plan: 'starter' | 'growth' | 'enterprise'): Promise<Tenant> {
        const tenant = await this.tenantRepo.findOne({ where: { id: userId } });
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${userId} not found`);
        }

        tenant.plan = plan;
        return this.tenantRepo.save(tenant);
    }

    async getTenantById(tenantId: string): Promise<Tenant> {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        return tenant;
    }

    async getAllUsers(): Promise<any[]> {
        const tenants = await this.tenantRepo.find({
            order: { createdAt: 'DESC' }
        });

        return tenants.map(t => ({
            id: t.id,
            name: t.name,
            email: (t as any).email || '',
            tenantName: t.name,
            currentPlan: t.plan || 'starter',
            status: 'active',
            createdAt: t.createdAt,
        }));
    }
}
