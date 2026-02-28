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
import { SystemConfig } from "@api/admin/entities/system-config.entity";
import { EncryptionService } from "@shared/encryption.service";
import { AuditService, LogLevel, LogCategory } from "@api/audit/audit.service";
import { RedisService } from "@shared/redis.service";

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
    value: "v21.0",
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

@Injectable()
export class AdminConfigService implements OnModuleInit {
  private readonly CACHE_PREFIX = "system_config:";
  private readonly CACHE_TTL = 3600; // 1 hour

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

    // Map keys to env vars
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
      "platform.app_url": "APP_URL",
    };

    // Start with defaults + Env fallback (Strict Priority)
    for (const [key, def] of Object.entries(DEFAULT_CONFIG)) {
      let value = def.value;
      const envKey = envMap[key];
      let source = "default";

      if (envKey) {
        const envVal = this.configService.get(envKey);
        if (envVal) {
          value = envVal;
          source = "env";
        }
      }

      result[key] = {
        value: def.isSecret && value ? "••••••••••••••••" : value,
        description: def.description,
        category: def.category,
        isSecret: def.isSecret || false,
        source: source,
        readOnly: source === "env",
      };
    }

    // Override with stored values only if not read-only (env-backed)
    for (const config of configs) {
      if (result[config.key]?.readOnly) continue;

      result[config.key] = {
        value: config.isSecret
          ? "••••••••••••••••"
          : config.value?.trim() || "",
        description: config.description,
        category: config.category,
        isSecret: config.isSecret,
        updatedAt: config.updatedAt,
        source: "database",
        readOnly: false,
      };
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

  async getConfigValue(key: string, tenantId?: string): Promise<string | null> {
    // Check Env first (Strict Priority)
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
      "platform.app_url": "APP_URL",
    };

    const envKey = envMap[key];
    if (envKey) {
      const envVal = this.configService.get(envKey);
      if (envVal) return envVal;
    }

    // Check Cache
    const cacheKey = tenantId ? `${tenantId}:${key}` : key;
    const cachedValue = await this.getCache(cacheKey);
    if (cachedValue) {
      const def = DEFAULT_CONFIG[key];
      return def?.isSecret
        ? this.encryptionService.decrypt(cachedValue)
        : cachedValue;
    }

    // Check Database (with multi-tenancy override support)
    const config = await this.configRepo.findOne({
      where: [
        { key, tenantId: tenantId ?? IsNull() },
        { key, tenantId: IsNull() }, // Fallback to global
      ],
      order: { tenantId: "DESC" }, // Prefer tenant override (non-null)
    });

    if (config) {
      await this.setCache(cacheKey, config.value);
      return config.isSecret
        ? this.encryptionService.decrypt(config.value)
        : config.value;
    }

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

      const isSecret =
        DEFAULT_CONFIG[key]?.isSecret || config?.isSecret || false;
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

    const SENSITIVE_KEYWORDS = [
      "KEY",
      "SECRET",
      "TOKEN",
      "PASSWORD",
      "AUTH",
      "CREDENTIAL",
    ];

    for (const [key, value] of Object.entries(envVars)) {
      // Skip internal node/system vars that might be too noisy
      if (
        key.startsWith("NODE_") ||
        key.startsWith("npm_") ||
        key === "PATH" ||
        key === "PWD" ||
        key === "HOME"
      ) {
        if (!key.includes("PORT") && !key.includes("URL")) continue;
      }

      const isSensitive = SENSITIVE_KEYWORDS.some((kw) =>
        key.toUpperCase().includes(kw),
      );

      result.push({
        key,
        value: isSensitive ? "••••••••••••••••" : value,
        isSensitive,
      });
    }

    return result.sort((a, b) => a.key.localeCompare(b.key));
  }
}
