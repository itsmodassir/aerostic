
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../entities/system-config.entity';
import { EncryptionService } from '../../common/encryption.service';
import { AuditService } from '../../audit/audit.service';

// Default configuration values with explicit typing
interface ConfigDef {
    value: string;
    description: string;
    category: string;
    isSecret?: boolean;
}

const DEFAULT_CONFIG: Record<string, ConfigDef> = {
    // Meta WhatsApp
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

    // Razorpay
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

    // AI
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

    // Platform
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

@Injectable()
export class AdminConfigService {
    constructor(
        @InjectRepository(SystemConfig)
        private configRepo: Repository<SystemConfig>,
        private configService: ConfigService,
        private encryptionService: EncryptionService,
        private auditService: AuditService,
    ) { }

    async getConfig(): Promise<Record<string, any>> {
        const configs = await this.configRepo.find();
        const result: Record<string, any> = {};

        // Map keys to env vars
        const envMap: Record<string, string> = {
            'meta.app_id': 'META_APP_ID',
            'meta.app_secret': 'META_APP_SECRET',
            'meta.webhook_verify_token': 'META_WEBHOOK_VERIFY_TOKEN',
            'meta.config_id': 'META_CONFIG_ID',
            'razorpay.key_id': 'RAZORPAY_KEY_ID',
            'razorpay.key_secret': 'RAZORPAY_KEY_SECRET',
            'razorpay.webhook_secret': 'RAZORPAY_WEBHOOK_SECRET',
            'ai.gemini_api_key': 'GEMINI_API_KEY',
            'platform.app_url': 'APP_URL',
        };

        // Keep track of which keys are from DB
        const dbKeys = new Set(configs.map(c => c.key));

        // Start with defaults + Env fallback
        for (const [key, def] of Object.entries(DEFAULT_CONFIG)) {
            let value = def.value;
            const envKey = envMap[key];
            let source = 'default';

            if (envKey) {
                const envVal = this.configService.get(envKey);
                if (envVal) {
                    value = envVal;
                    source = 'env';
                }
            }

            result[key] = {
                value: def.isSecret && value ? '••••••••••••••••' : value, // Mask if secret and has value
                description: def.description,
                category: def.category,
                isSecret: def.isSecret || false,
                source: source,
                readOnly: source === 'env', // Mark env-backed configs as readOnly
            };
        }

        // Override with stored values
        for (const config of configs) {
            result[config.key] = {
                value: config.isSecret ? '••••••••••••••••' : (config.value?.trim() || ''),
                description: config.description,
                category: config.category,
                isSecret: config.isSecret,
                updatedAt: config.updatedAt,
                source: 'database',
                readOnly: false,
            };
        }

        return result;
    }

    async getConfigValue(key: string): Promise<string | null> {
        const config = await this.configRepo.findOne({ where: { key } });
        if (config) {
            return config.isSecret ? this.encryptionService.decrypt(config.value) : config.value;
        }
        return DEFAULT_CONFIG[key]?.value || null;
    }

    async setConfig(
        updates: Record<string, string>,
        actorId: string = 'system',
    ): Promise<{ success: boolean; updated: string[] }> {
        const updated: string[] = [];

        // Check strict readonly enforcement
        const currentConfig = await this.getConfig();

        for (const [key, value] of Object.entries(updates)) {
            // Skip masked values (user didn't change them)
            if (value === '••••••••••••••••' || value === '') continue;

            console.log(`Updating config key: ${key}`);

            // Prevent overwriting env-managed keys
            if (currentConfig[key]?.readOnly) {
                console.warn(`Attempted to overwrite read-only config key: ${key}`);
                continue;
            }

            // Basic Validation for Numeric IDs
            if (['meta.app_id', 'meta.config_id'].includes(key)) {
                if (!/^\d+$/.test(value)) {
                    console.error(`Invalid numeric ID for ${key}: ${value}`);
                    continue; // Skip invalid numeric IDs
                }
            }

            let config = await this.configRepo.findOne({ where: { key } });
            const isSecret = config?.isSecret || DEFAULT_CONFIG[key]?.isSecret || false;
            const finalValue = isSecret ? this.encryptionService.encrypt(value) : value;

            if (config) {
                config.value = finalValue;
                await this.configRepo.save(config);
            } else {
                const defaultDef = DEFAULT_CONFIG[key] || {
                    description: key,
                    category: 'general',
                    isSecret: false,
                };
                config = this.configRepo.create({
                    key,
                    value: finalValue,
                    description: defaultDef.description || key,
                    category: defaultDef.category || 'general',
                    isSecret: defaultDef.isSecret || false,
                });
                await this.configRepo.save(config);
            }

            updated.push(key);
        }

        // Log action
        try {
            await this.auditService.logAction(
                'admin',
                'Administrator', // In real system, pass correct actor info
                'UPDATE_CONFIG',
                'System Configuration',
                undefined,
                { updatedKeys: updated },
            );
        } catch (auditError) {
            console.error('Failed to log configuration update to audit service:', auditError);
            // Don't fail the whole request if audit logging fails
        }

        return { success: true, updated };
    }

    async deleteConfig(key: string): Promise<void> {
        const config = await this.configRepo.findOne({ where: { key } });
        if (config) {
            await this.configRepo.remove(config);
            await this.auditService.logAction(
                'admin',
                'Administrator',
                'DELETE_CONFIG',
                key,
            );
        }
    }
}
