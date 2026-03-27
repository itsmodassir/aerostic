import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MetaToken } from "./entities/meta-token.entity";
import { WhatsappAccount } from "../whatsapp/entities/whatsapp-account.entity";
import { SystemConfig } from "@shared/database/entities/core/system-config.entity";
import { RedisService } from "@shared/redis.service";
import { EncryptionService } from "@shared/encryption.service";
import { Template } from "../templates/entities/template.entity";
import { AdminConfigService } from "../admin/services/admin-config.service";
import { WebhooksService } from "../webhooks/webhooks.service";

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);
  constructor(
    private configService: ConfigService,
    @InjectRepository(MetaToken)
    private metaTokenRepo: Repository<MetaToken>,
    @InjectRepository(WhatsappAccount)
    private whatsappAccountRepo: Repository<WhatsappAccount>,
    @InjectRepository(SystemConfig)
    private configRepo: Repository<SystemConfig>,
    @InjectRepository(Template)
    private templateRepo: Repository<Template>,
    private adminConfigService: AdminConfigService,
    private redisService: RedisService,
    private encryptionService: EncryptionService,
    private webhooksService: WebhooksService,
  ) { }

  private async getApiVersion(): Promise<string> {
    return (
      (await this.adminConfigService.getConfigValue("meta.api_version")) ||
      "v25.0"
    );
  }

  /**
   * VERIFY Webhook (GET)
   */
  async verifyWebhook(mode: string, token: string, challenge: string) {
    const verifyToken =
      (await this.adminConfigService.getConfigValue(
        "meta.webhook_verify_token",
      )) || "aimstors_verification_token";

    // 2. Validate
    if (mode === "subscribe" && token === verifyToken) {
      this.logger.log("Webhook verified successfully.");
      return challenge;
    } else {
      throw new BadRequestException(
        "Webhook verification failed: Invalid token.",
      );
    }
  }

  /**
   * HANDLE Webhook Events (POST)
   */
  async handleWebhookEvent(body: any) {
    this.logger.debug(`Received Webhook: ${JSON.stringify(body)}`);

    // Basic structure validation
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;

          // Handle Template Status Updates
          if (change.field === "message_template_status_update") {
            await this.handleTemplateStatus(value);
          }

          // 🔥 Handle Incoming Messages (Delegated to WebhooksService)
          if (value.messages || value.statuses) {
            await this.webhooksService.processWebhook(body);
            // We can break here as processWebhook handles the whole body
            return "EVENT_RECEIVED";
          }
        }
      }
    }
    return "EVENT_RECEIVED";
  }

  private async handleTemplateStatus(value: any) {
    const { message_template_id, message_template_name, event, reason } = value;
    this.logger.log(
      `Template Status Update: ${message_template_name} -> ${event}`,
    );

    // Find template by name (unique)
    // We can also check WABA ID if needed, but uniqueness should hold per tenant ideally.
    // However, uniqueName includes timestamp, so it is unique globaly in our system.

    // Note: message_template_name in webhook is the name we sent (uniqueName).
    const template = await this.templateRepo.findOne({
      where: { name: message_template_name },
    });

    if (template) {
      template.status = event; // APPROVED, REJECTED, PENDING
      if (reason) {
        template.rejectionReason = reason;
      }
      await this.templateRepo.save(template);
      this.logger.log(`Updated Template ${template.name} status to ${event}`);
    } else {
      this.logger.warn(`Template ${message_template_name} not found in DB.`);
    }
  }

  async handleOAuthCallback(
    code: string,
    tenantId: string,
    providedWabaId?: string,
    providedPhoneNumberId?: string,
    providedRedirectUri?: string,
  ) {
    const appId =
      (await this.adminConfigService.getConfigValue("meta.app_id")) || "";
    const appSecret =
      (await this.adminConfigService.getConfigValue("meta.app_secret")) || "";
    const redirectUri =
      providedRedirectUri ||
      (await this.adminConfigService.getConfigValue("meta.redirect_uri")) ||
      "https://app.aimstore.in/meta/callback";
    const apiVersion = await this.getApiVersion();

    this.logger.debug(`--- OAuth Callback Debug (${apiVersion}) ---`);
    this.logger.debug(`App ID: ${appId}`);
    this.logger.debug(`Redirect URI: ${redirectUri}`);
    this.logger.debug(`Tenant ID: ${tenantId}`);
    this.logger.debug(`Provided WABA: ${providedWabaId || "None"}`);
    this.logger.debug(`Provided Phone: ${providedPhoneNumberId || "None"}`);
    this.logger.debug("-------------------");

    try {
      // 1. Exchange auth code for short-lived access token
      this.logger.log(`Exchanging code for token. AppID: ${appId}, Redirect: ${redirectUri}`);
      const tokenRes = await axios.get(
        `https://graph.facebook.com/${apiVersion}/oauth/access_token`,
        {
          params: {
            client_id: appId,
            client_secret: appSecret,
            redirect_uri: redirectUri,
            code,
          },
        },
      ).catch(err => {
        this.logger.error(`OAuth code exchange failed: ${JSON.stringify(err.response?.data || err.message)}`);
        throw new Error(`Meta OAuth Exchange Failed: ${err.response?.data?.error?.message || err.message}`);
      });

      const shortToken = tokenRes.data.access_token;
      this.logger.log(`Short-lived token received successfully.`);

      // 2. Exchange short-lived token for long-lived token
      const longTokenData = await this.exchangeForLongLivedToken(
        shortToken,
        appId,
        appSecret,
      );
      const accessToken = longTokenData.access_token;
      const expiresAt = new Date(
        Date.now() + (longTokenData.expires_in || 5184000) * 1000,
      );

      // Embedded Signup Fix: Get assigned WABA directly via debug_token
      let wabaId = providedWabaId || null;

      try {
        const debugRes = await axios.get(
          `https://graph.facebook.com/${apiVersion}/debug_token`,
          {
            params: {
              input_token: accessToken,
              access_token: `${appId}|${appSecret}`,
            },
          },
        );

        const debugData = debugRes.data.data;
        this.logger.debug(`Token Debug: ${JSON.stringify(debugData)}`);

        // FALLBACK: Extract WABA ID from granular_scopes if not provided
        if (!wabaId && debugData.granular_scopes) {
          const wabaScope = debugData.granular_scopes.find(
            (s: any) => s.scope === "whatsapp_business_management",
          );
          if (wabaScope && wabaScope.target_ids?.length) {
            wabaId = wabaScope.target_ids[0];
            this.logger.debug(
              `Extracted WABA ID from granular_scopes: ${wabaId}`,
            );
          }
        }
      } catch (err: any) {
        this.logger.warn(`Debug token failed: ${err.response?.data?.error?.message || err.message}`);
      }

      // 3. Fetch WABA (Production Ready for Aimstors Solution Multi-Tenant)
      let waba = null;
      let businesses = [];

      if (!wabaId) {
        // Step 3a: Get Businesses
        try {
          const businessesRes = await axios.get(
            `https://graph.facebook.com/${apiVersion}/me/businesses`,
            {
              params: { access_token: accessToken },
            },
          );

          businesses = businessesRes.data.data || [];
          this.logger.debug(`Businesses found: ${JSON.stringify(businesses)}`);

          // Step 3b: Search WABA in each business
          for (const business of businesses) {
            try {
              // Try OWNED WABA first
              let wabaRes = await axios.get(
                `https://graph.facebook.com/${apiVersion}/${business.id}/owned_whatsapp_business_accounts`,
                {
                  params: { access_token: accessToken },
                },
              );

              if (wabaRes.data.data?.length) {
                waba = wabaRes.data.data[0];
                wabaId = waba.id;
                this.logger.debug(`Found OWNED WABA: ${wabaId}`);
                break;
              }

              // Try CLIENT WABA fallback (VERY IMPORTANT)
              wabaRes = await axios.get(
                `https://graph.facebook.com/${apiVersion}/${business.id}/client_whatsapp_business_accounts`,
                {
                  params: { access_token: accessToken },
                },
              );

              if (wabaRes.data.data?.length) {
                waba = wabaRes.data.data[0];
                wabaId = waba.id;
                this.logger.debug(`Found CLIENT WABA: ${wabaId}`);
                break;
              }
            } catch (err: any) {
              this.logger.warn(
                `Business ${business.id} WABA fetch failed: ${err.response?.data?.error?.message || err.message}`,
              );
            }
          }
        } catch (err: any) {
          this.logger.error(
            `Failed to fetch businesses: ${err.response?.data?.error?.message || err.message}`,
          );
        }
      }

      if (!wabaId) {
        this.logger.error(
          `Meta Response (businesses): ${JSON.stringify(businesses)}`,
        );
        throw new BadRequestException(
          "No WhatsApp Business Account (WABA) found. Please ensure you have a WABA associated with your Facebook account.",
        );
      }

      // 4. Fetch Phone Number
      const phoneRes = await axios.get(
        `https://graph.facebook.com/${apiVersion}/${wabaId}/phone_numbers`,
        {
          params: { access_token: accessToken },
        },
      );

      const numberData = phoneRes.data.data?.[0];
      const phoneNumberId = providedPhoneNumberId || numberData?.id;
      const displayPhoneNumber = numberData?.display_phone_number;

      if (!phoneNumberId) {
        throw new BadRequestException(
          "No Phone Number ID found for this account.",
        );
      }

      // 5. Save Mapping (Upsert)
      const existing = await this.whatsappAccountRepo.findOneBy({
        phoneNumberId,
      });

      const encryptedToken = this.encryptionService.encrypt(accessToken);

      if (existing) {
        existing.tenantId = tenantId;
        existing.wabaId = wabaId;
        existing.displayPhoneNumber = displayPhoneNumber;
        existing.accessToken = encryptedToken;
        existing.tokenExpiresAt = expiresAt;
        existing.status = "connected";
        await this.whatsappAccountRepo.save(existing);
      } else {
        await this.whatsappAccountRepo.save({
          tenantId,
          wabaId,
          phoneNumberId,
          displayPhoneNumber,
          accessToken: encryptedToken,
          tokenExpiresAt: expiresAt,
          mode: "coexistence",
          status: "connected",
        });
      }

      // 6. Subscribe App to WABA Webhooks
      try {
        await axios.post(
          `https://graph.facebook.com/${apiVersion}/${wabaId}/subscribed_apps`,
          {},
          {
            params: { access_token: accessToken },
          },
        );
        this.logger.log(`Successfully subscribed app to WABA: ${wabaId}`);
      } catch (subErr: any) {
        this.logger.error(
          `Failed to subscribe app to WABA: ${JSON.stringify(subErr.response?.data || subErr.message)}`,
        );
      }

      // 7. Initiate Data Synchronization
      try {
        const syncUrl = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/smb_app_data`;

        // Sync 1: Contacts
        await axios.post(
          syncUrl,
          { messaging_product: "whatsapp", sync_type: "smb_app_state_sync" },
          { params: { access_token: accessToken } },
        );

        // Sync 2: History
        await axios.post(
          syncUrl,
          { messaging_product: "whatsapp", sync_type: "history" },
          { params: { access_token: accessToken } },
        );
        this.logger.log(`Initiated SMB sync for: ${phoneNumberId}`);
      } catch (syncErr: any) {
        this.logger.error(
          `Failed to initiate SMB sync: ${JSON.stringify(syncErr.response?.data || syncErr.message)}`,
        );
      }

      // Invalidate Redis Cache
      await this.redisService.del(`whatsapp:token:${tenantId}`);

      return { success: true };
    } catch (e: any) {
      this.logger.error("Meta OAuth Handshake Failed:", e.response?.data || e.message);
      throw e;
    }
  }


  async getTemplates(wabaId: string, accessToken: string) {
    try {
      const url = `https://graph.facebook.com/${await this.getApiVersion()}/${wabaId}/message_templates`;
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          limit: 100,
          fields: "name,status,category,language,components,rejected_reason",
        },
      });
      return data.data;
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch templates from Meta: ${JSON.stringify(error.response?.data || error.message)}`,
      );
      return [];
    }
  }

  async findTemplate(wabaId: string, accessToken: string, name: string) {
    try {
      const url = `https://graph.facebook.com/${await this.getApiVersion()}/${wabaId}/message_templates`;
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          name: name,
          limit: 1,
          fields: "name,status,category,language,components,rejected_reason",
        },
      });
      return data.data?.[0] || null;
    } catch (error: any) {
      // Just return null if not found or error, to allow creation to proceed (or fail downstream with better error)
      return null;
    }
  }

  async createTemplate(wabaId: string, accessToken: string, templateData: any) {
    try {
      const url = `https://graph.facebook.com/${await this.getApiVersion()}/${wabaId}/message_templates`;
      const { data } = await axios.post(url, templateData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      return data;
    } catch (error: any) {
      this.logger.error(
        `Failed to create template on Meta: ${JSON.stringify(error.response?.data || error.message)}`,
      );
      throw new BadRequestException(
        error.response?.data?.error?.message ||
        "Failed to create WhatsApp template",
      );
    }
  }

  async exchangeForLongLivedToken(
    shortToken: string,
    appId: string,
    appSecret: string,
  ) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${await this.getApiVersion()}/oauth/access_token`,
        {
          params: {
            grant_type: "fb_exchange_token",
            client_id: appId,
            client_secret: appSecret,
            fb_exchange_token: shortToken,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Failed to exchange long-lived token: ${JSON.stringify(error.response?.data || error.message)}`,
      );
      throw new BadRequestException("Failed to exchange long-lived token");
    }
  }
}
