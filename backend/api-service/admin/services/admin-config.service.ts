import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { SystemConfig } from "@shared/database/entities/core/system-config.entity";
import { EncryptionService } from "@shared/encryption.service";
import { AuditService, LogLevel, LogCategory } from "@api/audit/audit.service";
import { RedisService } from "@shared/redis.service";
import { RlsContextUtil } from "@shared/authorization/utils/rls-context.util";

// Default configuration values with explicit typing
interface ConfigDef {
  value: string;
  description: string;
  category: string;
  isSecret?: boolean;
}

const DEFAULT_CONFIG: Record<string, ConfigDef> = {
  // Meta WhatsApp
  "meta.app_id": {
    value: "",
    description: "Meta App ID",
    category: "whatsapp",
    isSecret: false,
  },
  "meta.app_secret": {
    value: "",
    description: "Meta App Secret",
    category: "whatsapp",
    isSecret: true,
  },
  "meta.webhook_verify_token": {
    value: "",
    description: "Webhook Verify Token",
    category: "whatsapp",
    isSecret: false,
  },
  "meta.config_id": {
    value: "",
    description: "WhatsApp Configuration ID",
    category: "whatsapp",
    isSecret: false,
  },
  "meta.redirect_uri": {
    value: "https://app.aimstore.in/meta/callback",
    description: "Meta OAuth Redirect URI",
    category: "whatsapp",
    isSecret: false,
  },
  "meta.api_version": {
    value: "v25.0",
    description: "Meta Graph API Version",
    category: "whatsapp",
    isSecret: false,
  },
  "whatsapp.template_rate_inr": {
    value: "0.80",
    description: "Global Charge per WhatsApp Template message (INR)",
    category: "billing",
    isSecret: false,
  },
  "whatsapp.marketing_rate_meta": {
    value: "0.72",
    description: "Meta Price for Marketing Template (INR)",
    category: "billing",
    isSecret: false,
  },
  "whatsapp.marketing_rate_custom": {
    value: "0.80",
    description: "Platform Price for Marketing Template (INR)",
    category: "billing",
    isSecret: false,
  },
  "whatsapp.utility_rate_meta": {
    value: "0.30",
    description: "Meta Price for Utility Template (INR)",
    category: "billing",
    isSecret: false,
  },
  "whatsapp.utility_rate_custom": {
    value: "0.40",
    description: "Platform Price for Utility Template (INR)",
    category: "billing",
    isSecret: false,
  },
  "whatsapp.auth_rate_meta": {
    value: "0.30",
    description: "Meta Price for Authentication Template (INR)",
    category: "billing",
    isSecret: false,
  },
  "whatsapp.auth_rate_custom": {
    value: "0.35",
    description: "Platform Price for Authentication Template (INR)",
    category: "billing",
    isSecret: false,
  },

  // Razorpay
  "razorpay.key_id": {
    value: "",
    description: "Razorpay Key ID",
    category: "payment",
    isSecret: false,
  },
  "razorpay.key_secret": {
    value: "",
    description: "Razorpay Key Secret",
    category: "payment",
    isSecret: true,
  },
  "razorpay.webhook_secret": {
    value: "",
    description: "Razorpay Webhook Secret",
    category: "payment",
    isSecret: true,
  },

  // AI
  "ai.gemini_api_key": {
    value: "",
    description: "Google Gemini API Key",
    category: "ai",
    isSecret: true,
  },
  "ai.openai_api_key": {
    value: "",
    description: "OpenAI API Key (Optional)",
    category: "ai",
    isSecret: true,
  },

  // Platform
  "platform.app_url": {
    value: "https://app.aimstore.in",
    description: "Application URL",
    category: "platform",
    isSecret: false,
  },
  "platform.trial_days": {
    value: "14",
    description: "Trial Period (days)",
    category: "platform",
    isSecret: false,
  },
  "platform.message_rate_limit": {
    value: "100",
    description: "Message Rate Limit (per minute)",
    category: "platform",
    isSecret: false,
  },
  "platform.max_tenants": {
    value: "1000",
    description: "Max Tenants Per Server",
    category: "platform",
    isSecret: false,
  },
  "platform.ai_pause_minutes": {
    value: "30",
    description: "Minutes to pause AI when a human agent replies (Handover Mode)",
    category: "platform",
    isSecret: false,
  },
  "platform.ai_enabled": {
    value: "true",
    description: "Enable global AI auto-reply for all tenants",
    category: "platform",
    isSecret: false,
  },

  // Email / SMTP
  "email.smtp_host": {
    value: "",
    description: "SMTP Server Host (e.g. smtp.gmail.com)",
    category: "email",
    isSecret: false,
  },
  "email.smtp_port": {
    value: "587",
    description: "SMTP Server Port (587 for TLS, 465 for SSL)",
    category: "email",
    isSecret: false,
  },
  "email.smtp_secure": {
    value: "false",
    description: "Use SSL (true for port 465, false for STARTTLS on 587)",
    category: "email",
    isSecret: false,
  },
  "email.smtp_user": {
    value: "",
    description: "SMTP Authentication Username / Email",
    category: "email",
    isSecret: false,
  },
  "email.smtp_pass": {
    value: "",
    description: "SMTP Authentication Password / App Password",
    category: "email",
    isSecret: true,
  },
  "email.from_name": {
    value: "Aerostic",
    description: "Sender name shown in 'From' field",
    category: "email",
    isSecret: false,
  },
  "email.from_email": {
    value: "no-reply@aimstore.in",
    description: "Sender email address shown in 'From' field",
    category: "email",
    isSecret: false,
  },
  "email.otp_enabled": {
    value: "true",
    description: "Send OTP verification emails",
    category: "email",
    isSecret: false,
  },
  "email.welcome_enabled": {
    value: "true",
    description: "Send welcome emails to new users",
    category: "email",
    isSecret: false,
  },
  "email.forgot_password_enabled": {
    value: "true",
    description: "Send forgot password reset emails",
    category: "email",
    isSecret: false,
  },
  "email.promotional_enabled": {
    value: "false",
    description: "Send promotional / marketing emails",
    category: "email",
    isSecret: false,
  },
};


const PROTECTED_KEYS = new Set(Object.keys(DEFAULT_CONFIG));
const SAFE_ENV_WHITELIST = new Set([
  "NODE_ENV",
  "PORT",
  "APP_URL",
  "VERSION",
  "DB_TYPE",
  "REDIS_HOST",
  "REDIS_PORT",
  "LOG_LEVEL",
  "TIMEZONE",
]);

@Injectable()
export class AdminConfigService implements OnModuleInit {
  private readonly CACHE_PREFIX = "system_config:";
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly logger = new Logger(AdminConfigService.name);

  constructor(
    @InjectRepository(SystemConfig)
    private configRepo: Repository<SystemConfig>,
    private configService: ConfigService,
    private encryptionService: EncryptionService,
    private auditService: AuditService,
    private redisService: RedisService,
  ) { }

  async onModuleInit() {
    // Prime cache on startup
    const configs = await this.configRepo.find();
    for (const config of configs) {
      await this.setCache(config.key, config.value);
    }
  }

  private async getCache(key: string): Promise<string | null> {
    return this.redisService.get(`${this.CACHE_PREFIX}${key}`);
  }

  private async setCache(key: string, value: string): Promise<void> {
    await this.redisService.set(
      `${this.CACHE_PREFIX}${key}`,
      value,
      this.CACHE_TTL,
    );
  }

  private async invalidateCache(key: string): Promise<void> {
    await this.redisService.del(`${this.CACHE_PREFIX}${key}`);
  }

  async getConfig(): Promise<Record<string, any>> {
    const configs = await this.configRepo.find();
    const result: Record<string, any> = {};

    // Map keys to env vars (env vars are bootstrap seeds only, NOT overrides)
    const envMap: Record<string, string> = {
      "meta.app_id": "META_APP_ID",
      "meta.app_secret": "META_APP_SECRET",
      "meta.webhook_verify_token": "META_WEBHOOK_VERIFY_TOKEN",
      "meta.config_id": "META_CONFIG_ID",
      "meta.redirect_uri": "META_REDIRECT_URI",
      "razorpay.key_id": "RAZORPAY_KEY_ID",
      "razorpay.key_secret": "RAZORPAY_KEY_SECRET",
      "razorpay.webhook_secret": "RAZORPAY_WEBHOOK_SECRET",
      "ai.gemini_api_key": "GEMINI_API_KEY",
      "ai.openai_api_key": "OPENAI_API_KEY",
      "platform.app_url": "APP_URL",
    };

    // Build index of DB values (DB wins — admin panel is authoritative)
    const dbIndex: Record<string, SystemConfig> = {};
    for (const config of configs) {
      dbIndex[config.key] = config;
    }

    for (const [key, def] of Object.entries(DEFAULT_CONFIG)) {
      const dbConfig = dbIndex[key];

      if (dbConfig) {
        // DB row exists — it is the authoritative value
        result[key] = {
          value: dbConfig.isSecret ? "••••••••••••••••" : dbConfig.value?.trim() || "",
          description: dbConfig.description,
          category: dbConfig.category,
          isSecret: dbConfig.isSecret,
          updatedAt: dbConfig.updatedAt,
          source: "database",
          readOnly: false,
        };
      } else {
        // No DB row — show env var or hard default as a seed
        const envKey = envMap[key];
        const envVal = envKey ? this.configService.get(envKey) : null;
        const value = envVal || def.value;
        const source = envVal ? "env" : "default";
        result[key] = {
          value: def.isSecret && value ? "••••••••••••••••" : value,
          description: def.description,
          category: def.category,
          isSecret: def.isSecret || false,
          source,
          readOnly: false, // Admin can always override env seeds via admin panel
        };
      }
    }

    return result;
  }

  /**
   * Internal method to get the actual value, uses Redis cache.
   */
  async removeConfig(keys: string[], tenantId: string): Promise<{ success: boolean; removed: string[] }> {
    const removed: string[] = [];
    for (const key of keys) {
      const config = await this.configRepo.findOne({
        where: { key, tenantId },
      });

      if (config) {
        await this.configRepo.remove(config);
        const cacheKey = tenantId ? `${tenantId}:${key}` : key;
        await this.redisService.del(`${this.CACHE_PREFIX}${cacheKey}`);
        removed.push(key);
      }
    }
    return { success: true, removed };
  }

  /** Short alias for getConfigValue — used by EmailService and other services */
  async getValue(key: string, tenantId?: string): Promise<string | null> {
    return this.getConfigValue(key, tenantId);
  }

  private looksLikeEncryptedPayload(value: unknown): value is string {
    return (
      typeof value === "string" &&
      /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(value.trim())
    );
  }

  async getConfigValue(key: string, tenantId?: string): Promise<string | null> {
    // Priority order: DB (tenant) > DB (global) > ENV (bootstrap seed) > hard default
    // DB is always the authoritative source — admin panel changes take immediate effect.

    const envMap: Record<string, string> = {
      "meta.app_id": "META_APP_ID",
      "meta.app_secret": "META_APP_SECRET",
      "meta.webhook_verify_token": "META_WEBHOOK_VERIFY_TOKEN",
      "meta.config_id": "META_CONFIG_ID",
      "meta.redirect_uri": "META_REDIRECT_URI",
      "razorpay.key_id": "RAZORPAY_KEY_ID",
      "razorpay.key_secret": "RAZORPAY_KEY_SECRET",
      "razorpay.webhook_secret": "RAZORPAY_WEBHOOK_SECRET",
      "ai.gemini_api_key": "GEMINI_API_KEY",
      "ai.openai_api_key": "OPENAI_API_KEY",
      "platform.app_url": "APP_URL",
      "email.smtp_host": "SMTP_HOST",
      "email.smtp_port": "SMTP_PORT",
      "email.smtp_secure": "SMTP_SECURE",
      "email.smtp_user": "SMTP_USER",
      "email.smtp_pass": "SMTP_PASS",
    };

    // 1. Check Cache (fastest)
    const cacheKey = tenantId ? `${tenantId}:${key}` : key;
    const cachedValue = await this.getCache(cacheKey);
    if (cachedValue) {
      const def = DEFAULT_CONFIG[key];
      const resolvedValue = def?.isSecret
        ? this.encryptionService.decrypt(cachedValue)
        : cachedValue;

      if (def?.isSecret && this.looksLikeEncryptedPayload(resolvedValue)) {
        this.logger.warn(
          `Ignoring undecipherable cached secret for config key "${key}". Falling back to DB/env resolution.`,
        );
      } else {
        return resolvedValue;
      }
    }

    // 2. Check Database (tenant override first, then global)
    const configValue = await this.configRepo.manager.transaction(async (manager) => {
      await RlsContextUtil.setLocalContext(manager, tenantId || "");
      const config = await manager.findOne(SystemConfig, {
        where: [
          { key, tenantId: tenantId ?? IsNull() },
          { key, tenantId: IsNull() }, // Fallback to global
        ],
        order: { tenantId: "DESC" }, // Prefer tenant override (non-null)
      });

      if (config) {
        return config.isSecret
          ? this.encryptionService.decrypt(config.value)
          : config.value;
      }
      return null;
    });

    if (configValue !== null) {
      if (
        DEFAULT_CONFIG[key]?.isSecret &&
        this.looksLikeEncryptedPayload(configValue)
      ) {
        this.logger.warn(
          `Ignoring undecipherable stored secret for config key "${key}". Falling back to environment/default seed.`,
        );
      } else {
        const isSecret = DEFAULT_CONFIG[key]?.isSecret || false;
        const cacheVal = isSecret
          ? this.encryptionService.encrypt(configValue)
          : configValue;
        await this.setCache(cacheKey, cacheVal);
        return configValue;
      }
    }

    // 3. Fallback to ENV var (bootstrap seed — only used when no DB row exists yet)
    const envKey = envMap[key];
    if (envKey) {
      const envVal = this.configService.get(envKey);
      if (envVal) return envVal;
    }

    // 4. Hard default
    return DEFAULT_CONFIG[key]?.value || null;
  }

  async setConfig(
    updates: Record<string, string>,
    actorId: string = "system",
    tenantId: string | null = null,
  ): Promise<{ success: boolean; updated: string[] }> {
    const updated: string[] = [];
    const currentConfig = await this.getConfig();

    const VALIDATORS: Record<string, (v: string) => boolean> = {
      "platform.trial_days": (v) => /^\d+$/.test(v),
      "platform.message_rate_limit": (v) => /^\d+$/.test(v),
      "platform.max_tenants": (v) => /^\d+$/.test(v),
      "platform.app_url": (v) => {
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      "meta.app_id": (v) => /^\d+$/.test(v),
      "meta.config_id": (v) => /^\d+$/.test(v),
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value === "••••••••••••••••" || value === "") continue;

      // 1. Read-only check
      if (currentConfig[key]?.readOnly) {
        console.warn(`Attempted to overwrite read-only config key: ${key}`);
        continue;
      }

      // 2. Validation
      if (VALIDATORS[key] && !VALIDATORS[key](value)) {
        console.error(`Invalid value for ${key}: ${value}`);
        continue;
      }

      let config = await this.configRepo.findOne({
        where: { key, tenantId: tenantId ?? IsNull() },
      });

      const isSecret = DEFAULT_CONFIG[key]?.isSecret === true;
      const finalValue = isSecret
        ? this.encryptionService.encrypt(value)
        : value;

      if (config) {
        config.value = finalValue;
        config.updatedBy = actorId;
        await this.configRepo.save(config);
      } else {
        const defaultDef = DEFAULT_CONFIG[key] || {
          description: key,
          category: "general",
          isSecret: false,
        };
        config = this.configRepo.create({
          key,
          value: finalValue,
          tenantId: tenantId,
          description: defaultDef.description || key,
          category: defaultDef.category || "general",
          isSecret: isSecret,
          updatedBy: actorId,
        });
        await this.configRepo.save(config);
      }

      // 3. Cache Invalidation
      const cacheKey = tenantId ? `${tenantId}:${key}` : key;
      await this.setCache(cacheKey, finalValue);
      updated.push(key);
    }

    if (updated.length > 0) {
      await this.auditService.logAction(
        "admin",
        actorId,
        "UPDATE_CONFIG",
        "System Configuration",
        undefined,
        { updatedKeys: updated, tenantId },
      );
    }

    return { success: true, updated };
  }

  async deleteConfig(
    key: string,
    tenantId: string | null = null,
  ): Promise<void> {
    // 1. Protected keys check
    if (PROTECTED_KEYS.has(key)) {
      throw new Error(
        `Cannot delete protected system configuration key: ${key}`,
      );
    }

    const config = await this.configRepo.findOne({
      where: { key, tenantId: tenantId ?? IsNull() },
    });

    if (config) {
      await this.configRepo.remove(config);
      const cacheKey = tenantId ? `${tenantId}:${key}` : key;
      await this.invalidateCache(cacheKey);

      await this.auditService.logAction(
        "admin",
        "Administrator",
        "DELETE_CONFIG",
        key,
        undefined,
        { tenantId },
      );
    }
  }

  async getEnv(): Promise<any[]> {
    const envVars = process.env;
    const result = [];

    for (const [key, value] of Object.entries(envVars)) {
      const isWhitelisted = SAFE_ENV_WHITELIST.has(key);
      
      // If not whitelisted, only show first 4 chars + mask if it's not a secret keyword
      // But for better security, we just mask EVERYTHING not in whitelist.
      if (!isWhitelisted) {
        result.push({
          key,
          value: "••••••••••••••••",
          isSensitive: true,
        });
        continue;
      }

      result.push({
        key,
        value: value,
        isSensitive: false,
      });
    }

    return result.sort((a, b) => a.key.localeCompare(b.key));
  }
}
