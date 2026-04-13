import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import * as qs from "querystring";
import axios from "axios";
import { AutomationFlow, AutomationNode, AutomationEdge, AutomationStatus } from "../database/entities/core/automation-flow.entity";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { WhatsappAccount } from "./entities/whatsapp-account.entity";
import { RedisService } from "../redis.service";
import { EncryptionService } from "../encryption.service";
import { AdminConfigService } from "@api/admin/services/admin-config.service";
import { CatalogProduct } from "../database/entities/commerce/catalog-product.entity";

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly flowJsonVersion = "7.3";
  private readonly allowedFlowCategories = new Set([
    "SIGN_UP",
    "SIGN_IN",
    "APPOINTMENT_BOOKING",
    "LEAD_GENERATION",
    "CONTACT_US",
    "CUSTOMER_SUPPORT",
    "SURVEY",
    "OTHER",
  ]);

  constructor(
    private configService: ConfigService,
    private moduleRef: ModuleRef,
    @InjectRepository(WhatsappAccount)
    private whatsappAccountRepo: Repository<WhatsappAccount>,
    @InjectRepository(AutomationFlow)
    private automationFlowRepo: Repository<AutomationFlow>,
    @InjectQueue("whatsapp-messages")
    private messageQueue: Queue,
    @InjectRepository(CatalogProduct)
    private catalogProductRepo: Repository<CatalogProduct>,
    private redisService: RedisService,
    private encryptionService: EncryptionService,
  ) {}

  private get adminConfigService(): AdminConfigService | null {
    try {
      return this.moduleRef.get(AdminConfigService, { strict: false });
    } catch {
      return null;
    }
  }

  private reconnectRequiredMessage() {
    return "WhatsApp session expired or invalid. Please reconnect your WhatsApp account in Settings > WhatsApp.";
  }

  private resolveAccessToken(account: WhatsappAccount) {
    const decrypted = this.encryptionService.decrypt(account.accessToken);
    const token = typeof decrypted === "string" ? decrypted.trim() : "";

    if (!token || token.split(":").length === 3) {
      this.logger.error(`Token resolution failed for account ${account.id}. Possible encryption key mismatch.`);
      throw new BadRequestException(this.reconnectRequiredMessage());
    }

    return token;
  }

  private isMetaTokenError(metaError: any) {
    const code = metaError?.error?.code;
    const subcode = metaError?.error?.error_subcode;
    return code === 190 || subcode === 463 || subcode === 467;
  }

  private async markSessionInvalid(tenantId: string) {
    await this.whatsappAccountRepo.update(
      { tenantId },
      { status: "disconnected", tokenExpiresAt: new Date() },
    );
    await this.redisService.del(`whatsapp:token:${tenantId}`);
  }

  private async callMetaApi(url: string, options: RequestInit = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);

      const data = await response.json();
      if (!response.ok) {
        this.logger.error(`Meta API Error [${response.status}] for ${url}:`, JSON.stringify(data));
        return { ok: false, data, status: response.status };
      }
      return { ok: true, data, status: response.status };
    } catch (error) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        this.logger.error(`Meta API Timeout (${timeoutMs}ms) for ${url}`);
        throw new BadRequestException("Meta API timeout. Please try again.");
      }
      throw error;
    }
  }

  private async getMetaConfigValue(
    configKey: string,
    envKey: string,
    fallback = "",
  ): Promise<string> {
    const adminValue = await this.adminConfigService
      ?.getConfigValue(configKey)
      .catch(() => null);

    return (
      (typeof adminValue === "string" ? adminValue.trim() : "") ||
      (this.configService.get<string>(envKey) || "").trim() ||
      fallback
    );
  }

  async getApiVersion(): Promise<string> {
    return this.getMetaConfigValue("meta.api_version", "META_API_VERSION", "v25.0");
  }

  async getPublicConfig() {
    return {
      appId: await this.getMetaConfigValue("meta.app_id", "META_APP_ID"),
      configId: await this.getMetaConfigValue("meta.config_id", "META_CONFIG_ID"),
      redirectUri: await this.getMetaConfigValue(
        "meta.redirect_uri",
        "META_REDIRECT_URI",
        "https://app.aimstore.in/meta/callback",
      ),
    };
  }

  async getEmbeddedSignupUrl(
    tenantId: string,
    mode: "coexistence" | "cloud" = "coexistence",
  ) {
    const appId = await this.getMetaConfigValue("meta.app_id", "META_APP_ID");
    const configId = await this.getMetaConfigValue("meta.config_id", "META_CONFIG_ID");
    const redirectUri = await this.getMetaConfigValue(
      "meta.redirect_uri",
      "META_REDIRECT_URI",
      "https://app.aimstore.in/meta/callback",
    );
    const apiVersion = await this.getApiVersion();

    if (!appId || !configId || !redirectUri) {
      throw new BadRequestException(
        "Meta configuration is incomplete. Configure App ID, Config ID, and Redirect URI.",
      );
    }

    const state = `${tenantId}:${mode}`;
    const extras =
      mode === "coexistence"
        ? {
            // Coexistence onboarding keeps WA Business App usable on phone.
            featureType: "whatsapp_business_app_onboarding",
            sessionInfoVersion: "3",
          }
        : {
            // Cloud onboarding provisions direct Cloud API flow.
            featureType: "whatsapp_embedded_signup",
            sessionInfoVersion: "3",
          };
    const params = qs.stringify({
      client_id: appId,
      config_id: configId,
      redirect_uri: redirectUri,
      display: "popup",
      override_default_response_type: "true",
      scope: [
        "whatsapp_business_management",
        "whatsapp_business_messaging",
        "business_management",
      ].join(","),
      response_type: "code",
      state,
      extras: JSON.stringify(extras),
    });

    return `https://www.facebook.com/${apiVersion}/dialog/oauth?${params}`;
  }

  async getCredentials(tenantId: string) {
    const cacheKey = `whatsapp:token:${tenantId}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) return JSON.parse(cached);

    const account = await this.whatsappAccountRepo.findOne({ where: { tenantId } });
    if (!account) return null;

    const credentials = {
      wabaId: account.wabaId,
      phoneNumberId: account.phoneNumberId,
      accessToken: this.resolveAccessToken(account),
    };

    await this.redisService.set(cacheKey, JSON.stringify(credentials), 3600);
    return credentials;
  }

  async getStatus(tenantId: string) {
    const account = await this.whatsappAccountRepo.findOne({ where: { tenantId } });
    if (!account) return { connected: false };

    if (account.status === "connected") {
      try {
        const accessToken = this.resolveAccessToken(account);
        const apiVersion = await this.getApiVersion();

        const probe = await this.callMetaApi(
          `https://graph.facebook.com/${apiVersion}/${account.wabaId}?fields=id&access_token=${accessToken}`,
        );

        if (!probe.ok) {
          if (this.isMetaTokenError(probe.data)) {
            await this.markSessionInvalid(tenantId);
            const { accessToken: _accessToken, ...safeAccount } = account as any;
            return { connected: false, ...safeAccount };
          }
        }
      } catch (error) {
        this.logger.error(`Status probe failed for tenant ${tenantId}:`, error);
      }
    }

    const { accessToken: _accessToken, ...safeAccount } = account as any;
    return { connected: account.status === "connected", ...safeAccount };
  }

  async getAccountDetails(tenantId: string) {
    const account = await this.whatsappAccountRepo.findOne({ where: { tenantId } });
    if (!account) throw new BadRequestException("WhatsApp account not connected");

    return {
      businessId: account.businessId,
      wabaId: account.wabaId,
      phoneNumberId: account.phoneNumberId,
      displayPhoneNumber: account.displayPhoneNumber,
      verifiedName: account.verifiedName,
      qualityRating: account.qualityRating || "UNKNOWN",
      messagingLimit: account.messagingLimit || "UNKNOWN",
      status: account.status,
      webhookVerified: account.webhookVerified,
      messageCount: account.messageCount,
      lastSyncedAt: account.lastSyncedAt,
      tokenExpiresAt: account.tokenExpiresAt,
      mode: account.mode,
      createdAt: account.createdAt,
    };
  }

  async syncAccountFromMeta(tenantId: string) {
    const account = await this.whatsappAccountRepo.findOne({ where: { tenantId } });
    if (!account) throw new BadRequestException("WhatsApp account not connected");

    const accessToken = this.resolveAccessToken(account);
    const apiVersion = await this.getApiVersion();

    try {
      const response = await fetch(`https://graph.facebook.com/${apiVersion}/${account.phoneNumberId}?fields=verified_name,display_phone_number,quality_rating,messaging_limit_tier&access_token=${accessToken}`);
      const data = await response.json();

      if (!response.ok) throw new BadRequestException(data.error?.message || "Failed to sync with Meta");

      await this.whatsappAccountRepo.update(
        { tenantId },
        {
          verifiedName: data.verified_name,
          displayPhoneNumber: data.display_phone_number,
          qualityRating: data.quality_rating,
          messagingLimit: data.messaging_limit_tier,
          lastSyncedAt: new Date(),
        },
      );

      await this.redisService.del(`whatsapp:token:${tenantId}`);
      return { success: true, data };
    } catch (error) {
      this.logger.error("Sync error:", error);
      throw new BadRequestException("Sync failed.");
    }
  }

  async sendTestMessage(tenantId: string, to: string) {
    const credentials = await this.getCredentials(tenantId);
    if (!credentials) throw new BadRequestException("Account not connected");

    await this.messageQueue.add("send-test", {
      tenantId,
      to,
      payload: {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: { name: "hello_world", language: { code: "en_US" } },
      },
    }, { attempts: 3, backoff: 3000 });

    return { success: true };
  }

  async getFlows(tenantId: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    const response = await this.callMetaApi(`https://graph.facebook.com/${apiVersion}/${creds.wabaId}/flows?fields=id,name,status,updated_at&access_token=${creds.accessToken}`);
    if (!response.ok) throw new BadRequestException(response.data.error?.message || "Failed to fetch flows");
    const remoteFlows = Array.isArray(response.data.data) ? response.data.data : [];
    const remoteIds = remoteFlows.map((flow: any) => String(flow.id)).filter(Boolean);
    const localFlows = remoteIds.length > 0
      ? await this.automationFlowRepo.find({
          where: remoteIds.map((remoteId: string) => ({ tenantId, remoteId })),
        })
      : [];

    const localByRemoteId = new Map(localFlows.map((flow) => [String(flow.remoteId), flow]));
    const flowsToCreate = remoteFlows
      .filter((remoteFlow: any) => !localByRemoteId.has(String(remoteFlow.id)))
      .map((remoteFlow: any) =>
        this.automationFlowRepo.create({
          tenantId,
          name: remoteFlow.name || `flow_${remoteFlow.id}`,
          remoteId: String(remoteFlow.id),
          categories: ["OTHER"],
          trigger: "whatsapp_flow",
          status: this.toAutomationStatus(remoteFlow.status),
          triggerConfig: { canvas: { nodes: [], edges: [] } },
        }),
      );

    if (flowsToCreate.length > 0) {
      const created = await this.automationFlowRepo.save(flowsToCreate);
      created.forEach((flow: AutomationFlow) => localByRemoteId.set(String(flow.remoteId), flow));
    }

    return remoteFlows.map((remoteFlow: any) => {
      const localFlow = localByRemoteId.get(String(remoteFlow.id));
      return {
        ...remoteFlow,
        id: localFlow?.id || String(remoteFlow.id),
        localId: localFlow?.id || null,
        metaFlowId: String(remoteFlow.id),
        remoteId: String(remoteFlow.id),
        status: remoteFlow.status || localFlow?.status || AutomationStatus.DRAFT,
      };
    });
  }

  async createFlow(tenantId: string, name: string, categories: string[], initialCanvas?: any, endpointUri?: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();
    const normalizedName = this.normalizeFlowName(name);
    const normalizedCategories = this.normalizeFlowCategories(categories);

    // Atomic Creation: Prepare flow_json directly
    const flowJson = initialCanvas ? this.generateMetaFlowJson(initialCanvas) : {
      version: this.flowJsonVersion,
      screens: [{
        id: "WELCOME_SCREEN",
        title: "Welcome",
        terminal: true,
        layout: {
          type: "SingleColumnLayout",
          children: [
            { type: "TextHeading", text: "Welcome" },
            { type: "Footer", label: "Complete", "on-click-action": { name: "complete", payload: { status: "done" } } },
          ],
        },
      }],
    };

    const payload: any = { 
        name: normalizedName, 
        categories: normalizedCategories,
        flow_json: JSON.stringify(flowJson)
    };

    if (endpointUri) {
        payload.endpoint_uri = endpointUri;
        const appId = await this.getMetaConfigValue("meta.app_id", "META_APP_ID");
        if (appId) {
          payload.application_id = appId;
        }
    }

    const result = await this.callMetaApi(
      `https://graph.facebook.com/${apiVersion}/${creds.wabaId}/flows?access_token=${creds.accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!result.ok) {
      throw new BadRequestException(result.data?.error?.message || "Failed to create flow");
    }

    // Save to local record
    const newFlow = this.automationFlowRepo.create({
      tenantId,
      name: normalizedName,
      remoteId: result.data.id,
      categories: normalizedCategories,
      trigger: 'whatsapp_flow',
      status: AutomationStatus.DRAFT,
      endpointUri: endpointUri,
      isEndpointEnabled: !!endpointUri,
      triggerConfig: { canvas: initialCanvas || { nodes: [], edges: [] } }
    });
    await this.automationFlowRepo.save(newFlow);

    return {
      ...result.data,
      id: newFlow.id,
      localId: newFlow.id,
      metaFlowId: result.data.id,
      remoteId: result.data.id,
    };
  }

  private normalizeFlowName(name?: string): string {
    const base = (name || "").trim();
    if (!base) return `flow_${Date.now()}`;
    return base
      .replace(/[^a-zA-Z0-9 _-]/g, "")
      .replace(/\s+/g, " ")
      .slice(0, 64)
      .trim() || `flow_${Date.now()}`;
  }

  private normalizeFlowCategories(categories?: string[]): string[] {
    const normalized = (Array.isArray(categories) ? categories : [])
      .map((c) => String(c || "").trim().toUpperCase())
      .filter((c) => this.allowedFlowCategories.has(c));
    return normalized.length > 0 ? normalized : ["OTHER"];
  }

  async uploadFlowAsset(tenantId: string, flowId: string, filename: string, json: any) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();
    const metaFlowId = await this.resolveMetaFlowId(tenantId, flowId);

    // Use Buffer for Node.js compatibility with Meta API
    const fileBuffer = Buffer.from(JSON.stringify(json));
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: "application/json" });
    
    formData.append("file", blob, filename);
    formData.append("name", filename);
    formData.append("asset_type", "FLOW_JSON");

    const url = `https://graph.facebook.com/${apiVersion}/${metaFlowId}/assets?access_token=${creds.accessToken}`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      this.logger.error(`Meta Asset Upload Failed for flow ${flowId}:`, JSON.stringify(data));
      throw new BadRequestException(data.error?.message || "Asset upload failed");
    }

    const validationMessage = this.getFlowValidationMessage(data);
    if (validationMessage) {
      this.logger.error(`Meta Flow JSON Validation Failed for flow ${flowId}: ${validationMessage}`);
      throw new BadRequestException(validationMessage);
    }

    return data;
  }

  async uploadMedia(tenantId: string, file: Buffer, filename: string, mimetype: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file)], { type: mimetype });
    formData.append("file", blob, filename);
    formData.append("messaging_product", "whatsapp");
    
    let metaType = mimetype.split('/')[0];
    if (metaType === 'application' || !['image', 'video', 'audio'].includes(metaType)) {
      metaType = 'document';
    }
    formData.append("type", metaType);

    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${creds.phoneNumberId}/media?access_token=${creds.accessToken}`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    if (!response.ok) {
        throw new BadRequestException(data.error?.message || "Media upload failed");
    }
    return data;
  }

  async deleteFlow(tenantId: string, flowId: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    // Resolve ID (Meta Flow ID vs Internal UUID)
    const flow = await this.findFlowRecord(tenantId, flowId);
    const metaFlowId = flow?.remoteId || flowId;

    // 1. Delete from Meta
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${metaFlowId}?access_token=${creds.accessToken}`, { method: "DELETE" });
    const data = await response.json();
    
    if (!response.ok) {
        // If meta says not found, we still want to clean up locally
        if (response.status !== 404) {
             throw new BadRequestException(data.error?.message || "Delete from Meta failed");
        }
    }

    // 2. Delete from Local DB
    if (flow) {
      await this.automationFlowRepo.delete({ id: flow.id, tenantId });
    } else {
      await this.automationFlowRepo.delete({ remoteId: metaFlowId, tenantId });
    }
    
    return { success: true };
  }

  async publishFlow(tenantId: string, flowId: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    const flow = await this.findOrCreateFlowRecord(tenantId, flowId);
    const metaFlowId = flow.remoteId || await this.resolveMetaFlowId(tenantId, flowId);

    const flowJson = this.resolveFlowJsonForFlow(flow);
    await this.uploadFlowAsset(tenantId, flow.id, "flow.json", flowJson);

    this.logger.log(`Publishing Meta Flow ${metaFlowId} (Internal ID: ${flowId})`);

    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${metaFlowId}/publish?access_token=${creds.accessToken}`, { method: "POST" });
    const data = await response.json();
    
    if (!response.ok) {
      this.logger.error(`Meta Flow Publish Failed for ${metaFlowId}:`, JSON.stringify(data));
      const publishMessage =
        data.error?.error_user_msg ||
        data.error?.message ||
        "Publish failed. Check flow structure and Meta status.";
      throw new BadRequestException(publishMessage);
    }

    // Update status locally
    await this.automationFlowRepo.update(
      { id: flow.id, tenantId },
      { status: AutomationStatus.PUBLISHED },
    );
    
    return { success: true };
  }

  async deprecateFlow(tenantId: string, flowId: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();
    const metaFlowId = await this.resolveMetaFlowId(tenantId, flowId);

    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${metaFlowId}/deprecate?access_token=${creds.accessToken}`, { method: "POST" });
    const data = await response.json();

    if (!response.ok) {
      this.logger.error(`Meta Flow Deprecate Failed for ${flowId}:`, JSON.stringify(data));
      throw new BadRequestException(data.error?.message || "Deprecate failed.");
    }

    return { success: true };
  }


  async getFlowAssets(tenantId: string, flowId: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();
    const metaFlowId = await this.resolveMetaFlowId(tenantId, flowId);

    const res = await fetch(`https://graph.facebook.com/${apiVersion}/${metaFlowId}/assets?access_token=${creds.accessToken}`);
    const data = await res.json();
    if (!res.ok || !data.data?.[0]) throw new BadRequestException("No assets found");

    const downloadRes = await fetch(data.data[0].download_url);
    return downloadRes.json();
  }

  async getPublishedFlows(tenantId: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    const res = await fetch(`https://graph.facebook.com/${apiVersion}/${creds.wabaId}/flows?fields=id,name,status,categories&status=PUBLISHED&access_token=${creds.accessToken}`);
    const data = await res.json();
    if (!res.ok) throw new BadRequestException(data.error?.message || "Fetch failed");
    return data.data || [];
  }

  async triggerSmbSync(tenantId: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    const syncUrl = `https://graph.facebook.com/${apiVersion}/${creds.phoneNumberId}/smb_app_data`;
    
    await fetch(syncUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${creds.accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", sync_type: "smb_app_state_sync" }),
    });

    return { success: true };
  }

  async disconnect(tenantId: string) {
    await this.whatsappAccountRepo.delete({ tenantId });
    await this.redisService.del(`whatsapp:token:${tenantId}`);
    return { success: true };
  }

  // ─── Business Profile ───────────────────────────────────────────────────────

  async getBusinessProfile(tenantId: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    const url = `https://graph.facebook.com/${apiVersion}/${creds.phoneNumberId}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical&access_token=${creds.accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new BadRequestException(data.error?.message || "Failed to fetch profile");
    }

    return data.data?.[0] || data;
  }

  async updateBusinessProfile(tenantId: string, profileData: any) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    const allowedFields = ["about", "address", "description", "email", "websites", "vertical"];
    const payload: any = { messaging_product: "whatsapp" };
    
    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        payload[field] = profileData[field];
      }
    });

    const url = `https://graph.facebook.com/${apiVersion}/${creds.phoneNumberId}/whatsapp_business_profile?access_token=${creds.accessToken}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new BadRequestException(data.error?.message || "Failed to update profile");
    }

    return { success: true, data };
  }

  async uploadProfilePhoto(tenantId: string, file: Buffer, mimetype: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file)], { type: mimetype });
    formData.append("file", blob, "profile.jpg");
    formData.append("messaging_product", "whatsapp");
    formData.append("type", "image");

    const mediaRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/${creds.phoneNumberId}/media?access_token=${creds.accessToken}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const mediaData = await mediaRes.json();
    if (!mediaRes.ok) throw new BadRequestException(mediaData.error?.message || "Media upload failed");
    
    const mediaId = mediaData.id;
    
    const updateUrl = `https://graph.facebook.com/${apiVersion}/${creds.phoneNumberId}/whatsapp_business_profile?access_token=${creds.accessToken}`;
    const updateRes = await fetch(updateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
         messaging_product: "whatsapp",
         profile_picture_handle: mediaId
      }),
    });

    const updateData = await updateRes.json();
    if (!updateRes.ok) {
      throw new BadRequestException(updateData.error?.message || "Failed to update profile photo");
    }

    return { success: true, mediaId };
  }

  // ─── Flow Canvas Persistence ───────────────────────────────────────────────

  async saveFlowCanvas(tenantId: string, flowId: string, payload: { name: string; flowData: any }) {
    const flow = await this.findOrCreateFlowRecord(tenantId, flowId);

    flow.name = payload.name;
    flow.triggerConfig = { ...flow.triggerConfig, canvas: payload.flowData };
    flow.status = AutomationStatus.DRAFT;
    await this.automationFlowRepo.save(flow);

    const flowJson = this.resolveFlowJsonForFlow(flow);
    try {
      await this.uploadFlowAsset(tenantId, flow.id, "flow.json", flowJson);
      return {
        success: true,
        id: flow.id,
        metaFlowId: flow.remoteId,
        metaValidation: { ok: true },
      };
    } catch (err: any) {
      const message = err?.response?.message || err?.message || "Flow JSON validation failed";
      this.logger.error("Failed to sync flow.json asset on save", err);
      return {
        success: true,
        id: flow.id,
        metaFlowId: flow.remoteId,
        metaValidation: {
          ok: false,
          message,
          json: flowJson,
        },
      };
    }
  }

  async getFlowCanvas(tenantId: string, flowId: string) {
    const flow = await this.findFlowRecord(tenantId, flowId);
    if (!flow) throw new BadRequestException("Flow not found");
    return flow.triggerConfig?.canvas || { nodes: [], edges: [] };
  }

  async getFlowJsonEditor(tenantId: string, flowId: string) {
    const flow = await this.findOrCreateFlowRecord(tenantId, flowId);
    const generatedJson = this.generateMetaFlowJson(flow.triggerConfig?.canvas);
    const customJson = flow.triggerConfig?.metaFlowJsonOverride || null;
    return {
      generatedJson,
      activeJson: customJson || generatedJson,
      hasCustomOverride: Boolean(customJson),
    };
  }

  async updateFlowJsonEditor(
    tenantId: string,
    flowId: string,
    payload: { json: any; useCustomOverride?: boolean },
  ) {
    const flow = await this.findOrCreateFlowRecord(tenantId, flowId);
    const json = this.normalizeFlowJsonInput(payload?.json);
    this.assertValidFlowJsonShape(json);

    flow.triggerConfig = {
      ...(flow.triggerConfig || {}),
      metaFlowJsonOverride: payload?.useCustomOverride === false ? null : json,
    };

    await this.automationFlowRepo.save(flow);
    await this.uploadFlowAsset(tenantId, flow.id, "flow.json", json);

    return {
      success: true,
      activeJson: json,
      hasCustomOverride: payload?.useCustomOverride !== false,
    };
  }

  async clearFlowJsonOverride(tenantId: string, flowId: string) {
    const flow = await this.findOrCreateFlowRecord(tenantId, flowId);
    flow.triggerConfig = {
      ...(flow.triggerConfig || {}),
      metaFlowJsonOverride: null,
    };
    await this.automationFlowRepo.save(flow);

    const generatedJson = this.generateMetaFlowJson(flow.triggerConfig?.canvas);
    await this.uploadFlowAsset(tenantId, flow.id, "flow.json", generatedJson);

    return {
      success: true,
      activeJson: generatedJson,
      hasCustomOverride: false,
    };
  }

  private generateMetaFlowJson(canvas: any) {
    const nodes = Array.isArray(canvas?.nodes) ? canvas.nodes : [];
    const edges = Array.isArray(canvas?.edges) ? canvas.edges : [];
    const supportedNodeTypes = new Set(["wa_text", "wa_question", "wa_mcq", "wa_link"]);

    const traversal = this.collectPublishableFlowNodes(nodes, edges);
    const publishableNodes = traversal.publishable;

    if (publishableNodes.length === 0) {
      return this.createDefaultMetaFlowJson();
    }

    const unsupported = traversal.unsupported;
    if (unsupported.length > 0) {
      const labels = unsupported
        .map((node: any) => String(node?.data?.label || node?.type || "Unknown"))
        .slice(0, 5)
        .join(", ");
      throw new BadRequestException(
        `This flow uses builder nodes that cannot be published to Meta yet: ${labels}. Supported Meta nodes right now: Text Message, Question, Multiple Choice.`,
      );
    }

    if (publishableNodes.every((node: any) => ["wa_text", "wa_link"].includes(node.type))) {
      return this.buildCollapsedMetaFlowJson(publishableNodes);
    }

    const screenIdByNodeId = new Map<string, string>();
    publishableNodes.forEach((node: any, index: number) => {
      const screenId =
        index === 0 ? "WELCOME_SCREEN" : this.toMetaFlowScreenId(node.id, index);
      screenIdByNodeId.set(node.id, screenId);
    });

    const routingModel: Record<string, string[]> = {};

    const screens = publishableNodes.map((node: any, index: number) => {
      const data = node.data || {};
      const screenChildren: any[] = [];
      const formChildren: any[] = [];
      const screenId = screenIdByNodeId.get(node.id) || this.toMetaFlowScreenId(node.id, index);
      const questionLabel = String(data.questionLabel || data.label || "Your Response").slice(0, 35);

      // Map components based on node type
      if (node.type === "wa_text") {
        screenChildren.push({ type: "TextBody", text: data.text || "Hello" });
      } else if (node.type === "wa_link") {
        const linkTitle = data.linkTitle || "Visit Link";
        const linkUrl = data.linkUrl || "https://";
        screenChildren.push({ type: "TextBody", text: `🔗 *${linkTitle}*\n${linkUrl}` });
      } else if (node.type === "wa_question") {
        screenChildren.push({ type: "TextBody", text: data.questionText || "Please answer:" });
        formChildren.push({
          type: "TextInput",
          label: questionLabel,
          name: this.toMetaFlowFieldName(data.questionSaveAs || "response"),
          required: true,
        });
      } else if (node.type === "wa_mcq") {
        const options = (data.mcqOptions || [])
          .map((o: any, optionIndex: number) => ({
            id: this.toMetaFlowOptionId(o?.id || o?.title || `option_${optionIndex + 1}`),
            title: String(o?.title || `Option ${optionIndex + 1}`).slice(0, 200),
          }))
          .filter((option: any) => option.title);

        screenChildren.push({ type: "TextBody", text: data.mcqBody || "Select an option:" });
        formChildren.push({
          type: "RadioButtonsGroup",
          label: String(data.mcqLabel || "Options").slice(0, 35),
          name: this.toMetaFlowFieldName(`mcq_${node.id}`),
          "data-source": options,
          required: true,
        });
      }

      if (screenChildren.length === 0 && formChildren.length === 0) {
        screenChildren.push({
          type: "TextBody",
          text: String(data.text || data.label || "Continue"),
        });
      }

      // Meta screens can only route to other publishable content screens.
      const nextSequenceNode = publishableNodes[index + 1];
      const nextTargets = nextSequenceNode
        ? [screenIdByNodeId.get(nextSequenceNode.id)].filter(
            (targetId: string | undefined): targetId is string => Boolean(targetId),
          )
        : [];
      const isTerminal = nextTargets.length === 0;
      if (nextTargets.length > 0) {
        routingModel[screenId] = nextTargets;
      }

      const footer: any = {
        type: "Footer",
        label: isTerminal ? "Complete" : "Next",
      };

      if (isTerminal) {
        footer["on-click-action"] = {
          name: "complete",
          payload: { status: "done" },
        };
      } else {
        footer["on-click-action"] = {
          name: "navigate",
          next: {
            type: "screen",
            name: nextTargets[0],
          },
        };
      }

      if (formChildren.length > 0) {
        formChildren.push(footer);
        screenChildren.push({
          type: "Form",
          name: this.toMetaFlowFieldName(`form_${node.id}`),
          children: formChildren,
        });
      } else {
        screenChildren.push(footer);
      }

      return {
        id: screenId,
        title: (data.label || "Screen").slice(0, 20),
        terminal: isTerminal,
        layout: {
          type: "SingleColumnLayout",
          children: screenChildren,
        },
      };
    });

    const flowJson: Record<string, any> = {
      version: this.flowJsonVersion,
      screens
    };

    if (Object.keys(routingModel).length > 0) {
      flowJson.routing_model = routingModel;
    }

    return flowJson;
  }

  private createDefaultMetaFlowJson() {
    return {
      version: this.flowJsonVersion,
      screens: [
        {
          id: "WELCOME_SCREEN",
          title: "Welcome",
          terminal: true,
          layout: {
            type: "SingleColumnLayout",
            children: [
              { type: "TextHeading", text: "Welcome" },
              {
                type: "Footer",
                label: "Complete",
                "on-click-action": {
                  name: "complete",
                  payload: { status: "done" },
                },
              },
            ],
          },
        },
      ],
    };
  }

  private buildCollapsedMetaFlowJson(nodes: any[]) {
    const children: any[] = nodes.flatMap((node: any) => {
      const data = node?.data || {};
      if (node.type === "wa_link") {
        const body = [data.linkTitle, data.linkDescription, data.linkUrl]
          .filter(Boolean)
          .join("\n");
        return [{ type: "TextBody", text: body || "Visit Link" }];
      }
      return [{ type: "TextBody", text: String(data.text || data.label || "Continue") }];
    });

    children.push({
      type: "Footer",
      label: "Complete",
      "on-click-action": {
        name: "complete",
        payload: { status: "done" },
      },
    });

    return {
      version: this.flowJsonVersion,
      screens: [
        {
          id: "WELCOME_SCREEN",
          title: "Welcome",
          terminal: true,
          layout: {
            type: "SingleColumnLayout",
            children,
          },
        },
      ],
    };
  }

  private collectPublishableFlowNodes(nodes: any[], edges: any[]) {
    const nodeById = new Map(nodes.map((node: any) => [String(node.id || node.nodeId), node]));
    const outgoing = new Map<string, any[]>();
    edges.forEach((edge: any) => {
      const source = String(edge?.source || edge?.sourceNodeId || "");
      if (!source) return;
      const list = outgoing.get(source) || [];
      list.push(edge);
      outgoing.set(source, list);
    });

    const sortEdges = (sourceId: string) =>
      (outgoing.get(sourceId) || []).slice().sort((a: any, b: any) => {
        const targetA = nodeById.get(String(a?.target || a?.targetNodeId || ""));
        const targetB = nodeById.get(String(b?.target || b?.targetNodeId || ""));
        const yA = Number(targetA?.position?.y ?? 0);
        const yB = Number(targetB?.position?.y ?? 0);
        if (yA !== yB) return yA - yB;
        const xA = Number(targetA?.position?.x ?? 0);
        const xB = Number(targetB?.position?.x ?? 0);
        return xA - xB;
      });

    const visited = new Set<string>();
    const publishable: any[] = [];
    const unsupported: any[] = [];
    const publishableTypes = new Set(["wa_text", "wa_question", "wa_mcq", "wa_link"]);

    const walk = (nodeId?: string | null) => {
      const id = String(nodeId || "");
      if (!id || visited.has(id)) return;
      visited.add(id);
      const node = nodeById.get(id);
      if (!node) return;

      if (publishableTypes.has(node.type)) {
        publishable.push(node);
      } else if (node.type !== "wa_start" && node.type !== "wa_end") {
        unsupported.push(node);
      }

      for (const edge of sortEdges(id)) {
        walk(String(edge?.target || edge?.targetNodeId || ""));
      }
    };

    const startNodes = nodes
      .filter((node: any) => node?.type === "wa_start")
      .sort((a: any, b: any) => Number(a?.position?.y ?? 0) - Number(b?.position?.y ?? 0));

    if (startNodes.length > 0) {
      startNodes.forEach((node: any) => walk(node.id || node.nodeId));
    }

    nodes
      .filter((node: any) => !visited.has(String(node?.id || node?.nodeId || "")))
      .sort((a: any, b: any) => {
        const yDiff = Number(a?.position?.y ?? 0) - Number(b?.position?.y ?? 0);
        if (yDiff !== 0) return yDiff;
        return Number(a?.position?.x ?? 0) - Number(b?.position?.x ?? 0);
      })
      .forEach((node: any) => walk(node.id || node.nodeId));

    return { publishable, unsupported };
  }

  private resolveFlowJsonForFlow(flow: AutomationFlow) {
    const override = flow?.triggerConfig?.metaFlowJsonOverride;
    return override || this.generateMetaFlowJson(flow?.triggerConfig?.canvas);
  }

  private normalizeFlowJsonInput(input: any) {
    if (typeof input === "string") {
      try {
        return JSON.parse(input);
      } catch {
        throw new BadRequestException("Invalid JSON format");
      }
    }
    if (!input || typeof input !== "object") {
      throw new BadRequestException("Flow JSON must be an object");
    }
    return input;
  }

  private assertValidFlowJsonShape(json: any) {
    if (!json || typeof json !== "object") {
      throw new BadRequestException("Flow JSON must be an object");
    }
    if (!Array.isArray(json.screens) || json.screens.length === 0) {
      throw new BadRequestException("Flow JSON must include at least one screen");
    }

    const screenIds = new Set<string>();
    json.screens.forEach((screen: any, index: number) => {
      const screenId = String(screen?.id || "").trim();
      if (!screenId) {
        throw new BadRequestException(`Screen ${index + 1} is missing an id`);
      }
      if (screenIds.has(screenId)) {
        throw new BadRequestException(`Duplicate screen id: ${screenId}`);
      }
      screenIds.add(screenId);
      if (!screen?.layout || screen.layout.type !== "SingleColumnLayout" || !Array.isArray(screen.layout.children)) {
        throw new BadRequestException(`Screen ${screenId} must use SingleColumnLayout with children`);
      }
    });

    const routingModel = json.routing_model;
    if (routingModel && typeof routingModel === "object") {
      Object.entries(routingModel).forEach(([source, targets]) => {
        if (!screenIds.has(source)) {
          throw new BadRequestException(`routing_model source screen not found: ${source}`);
        }
        if (!Array.isArray(targets)) {
          throw new BadRequestException(`routing_model targets for ${source} must be an array`);
        }
        targets.forEach((target: any) => {
          if (!screenIds.has(String(target))) {
            throw new BadRequestException(`routing_model target screen not found: ${String(target)}`);
          }
        });
      });
    }
  }

  private getFlowValidationMessage(data: any): string | null {
    const candidates = [
      data?.validation_errors,
      data?.validationErrors,
      data?.errors,
      data?.error?.error_data?.details,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate) && candidate.length > 0) {
        const summary = candidate
          .slice(0, 3)
          .map((item: any) => {
            if (typeof item === "string") return item;
            const path = item?.error_path || item?.path || item?.field || item?.location;
            const message = item?.message || item?.error || item?.description || JSON.stringify(item);
            return path ? `${path}: ${message}` : message;
          })
          .join(" | ");
        return `Flow JSON validation failed: ${summary}`;
      }
      if (typeof candidate === "string" && candidate.trim()) {
        return `Flow JSON validation failed: ${candidate.trim()}`;
      }
    }

    return null;
  }

  private toMetaFlowScreenId(rawId: string, index: number): string {
    const normalized = String(rawId || "")
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
    const candidate = normalized ? `SCREEN_${normalized}` : `SCREEN_${index + 1}`;
    return candidate.slice(0, 80);
  }

  private toMetaFlowFieldName(rawName: string): string {
    const normalized = String(rawName || "")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
    return (normalized || "response").slice(0, 40);
  }

  private toMetaFlowOptionId(rawId: string): string {
    const normalized = String(rawId || "")
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
    return (normalized || "OPTION").slice(0, 80);
  }

  private async resolveMetaFlowId(tenantId: string, flowId: string) {
    if (!this.isUuidLike(flowId)) {
      return flowId;
    }

    const flow = await this.automationFlowRepo.findOne({ where: { id: flowId, tenantId } });
    if (!flow?.remoteId) {
      throw new BadRequestException("Flow not yet initialized on Meta. Save it first.");
    }

    return flow.remoteId;
  }

  private isUuidLike(value?: string | null): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
  }

  private toAutomationStatus(status?: string | null): AutomationStatus {
    const normalized = String(status || "").toUpperCase();
    if (normalized === "PUBLISHED") return AutomationStatus.PUBLISHED;
    if (normalized === "DEPRECATED") return AutomationStatus.DEPRECATED;
    return AutomationStatus.DRAFT;
  }

  private async findFlowRecord(tenantId: string, flowId: string) {
    if (this.isUuidLike(flowId)) {
      return this.automationFlowRepo.findOne({ where: { id: flowId, tenantId } });
    }

    return this.automationFlowRepo.findOne({ where: { remoteId: flowId, tenantId } });
  }

  private async findOrCreateFlowRecord(tenantId: string, flowId: string) {
    const existing = await this.findFlowRecord(tenantId, flowId);
    if (existing) {
      return existing;
    }

    if (this.isUuidLike(flowId)) {
      throw new BadRequestException("Flow record not found");
    }

    const created = this.automationFlowRepo.create({
      tenantId,
      name: `flow_${flowId}`,
      remoteId: flowId,
      categories: ["OTHER"],
      trigger: "whatsapp_flow",
      status: AutomationStatus.DRAFT,
      triggerConfig: { canvas: { nodes: [], edges: [] } },
    });

    return this.automationFlowRepo.save(created);
  }

  /**
   * Fetch Commerce Accounts and associated Catalogs for a WABA.
   */
  async fetchAvailableCatalogs(tenantId: string) {
    const account = await this.whatsappAccountRepo.findOneBy({ tenantId });
    if (!account) throw new BadRequestException("Account not found");

    const token = this.resolveAccessToken(account);
    const apiVersion = await this.getApiVersion();

    // 1. Get Commerce Accounts
    const commRes = await this.callMetaApi(
      `https://graph.facebook.com/${apiVersion}/${account.wabaId}/commerce_accounts?access_token=${token}`,
    );
    if (!commRes.ok) return [];

    const commerceAccounts = commRes.data.data || [];
    const allCatalogs = [];

    // 2. For each Commerce Account, get Catalogs
    for (const comm of commerceAccounts) {
      const catRes = await this.callMetaApi(
        `https://graph.facebook.com/${apiVersion}/${comm.id}/catalogs?access_token=${token}`,
      );
      if (catRes.ok) {
        allCatalogs.push(
          ...(catRes.data.data || []).map((cat: any) => ({
            ...cat,
            commerce_account_id: comm.id,
          })),
        );
      }
    }

    return allCatalogs;
  }

  /**
   * Pull products from Meta Catalog and mirror them in Aerostic DB.
   */
  async syncCatalogProducts(tenantId: string, catalogId?: string) {
    const account = await this.whatsappAccountRepo.findOneBy({ tenantId });
    if (!account) throw new BadRequestException("Account not found");

    const targetCatalogId = catalogId || account.catalogId;
    if (!targetCatalogId) return { success: false, message: "No catalog linked" };

    const token = this.resolveAccessToken(account);
    const apiVersion = await this.getApiVersion();

    // Fetch products from Meta
    const res = await this.callMetaApi(
      `https://graph.facebook.com/${apiVersion}/${targetCatalogId}/products?fields=retailer_id,name,description,price,currency,image_url,category,availability&access_token=${token}`,
    );

    if (!res.ok) return { success: false, error: res.data };

    const metaProducts = res.data.data || [];

    // Batch upsert into CatalogProduct
    for (const p of metaProducts) {
      await this.catalogProductRepo.upsert(
        {
          tenantId: account.tenantId,
          retailerId: p.retailer_id,
          name: p.name,
          description: p.description,
          price: (p.price || 0) / 100, // Meta often returns price in cents/sub-units
          currency: p.currency || "INR",
          imageUrl: p.image_url,
          category: p.category,
          availability: p.availability === "in stock",
          metaProductId: p.id,
          metadata: p,
        },
        ["tenantId", "retailerId"],
      );
    }

    await this.whatsappAccountRepo.update({ tenantId }, { lastSyncedAt: new Date() });

    return { success: true, count: metaProducts.length };
  }

  /**
   * Push a product to Meta Catalog.
   */
  async pushMetaProduct(tenantId: string, product: CatalogProduct) {
    const account = await this.whatsappAccountRepo.findOneBy({ tenantId });
    if (!account || !account.catalogId) {
      throw new BadRequestException("No Meta Catalog linked to this account.");
    }

    const token = this.resolveAccessToken(account);
    const apiVersion = await this.getApiVersion();

    const payload = {
      name: product.name,
      description: product.description || product.name,
      retailer_id: product.retailerId,
      currency: product.currency || "INR",
      price: Math.round(Number(product.price) * 100), // Meta expects price in subunits (e.g. cents)
      image_url: product.imageUrl,
      brand: product.brand || account.verifiedName || "Aimstore",
      url: product.url || `https://aimstore.in/p/${product.retailerId}`,
      condition: product.condition || "new",
      availability: product.availability ? "in stock" : "out of stock",
    };

    const res = await this.callMetaApi(
      `https://graph.facebook.com/${apiVersion}/${account.catalogId}/products?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      this.logger.error(`Meta Product Push Failed: ${JSON.stringify(res.data)}`);
      throw new BadRequestException(res.data.error?.message || "Failed to push product to Meta");
    }

    return res.data;
  }

  async deleteMetaProduct(tenantId: string, retailerId: string) {
    const account = await this.whatsappAccountRepo.findOneBy({ tenantId, status: "connected" });
    if (!account || !account.catalogId) throw new BadRequestException("Catalog ID not found for this account");

    const token = this.resolveAccessToken(account);
    const apiVersion = await this.getApiVersion();

    const res = await this.callMetaApi(
      `https://graph.facebook.com/${apiVersion}/${account.catalogId}/items_batch?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [{
            method: "DELETE",
            retailer_id: retailerId
          }]
        }),
      }
    );

    if (!res.ok) {
        throw new BadRequestException(res.data.error?.message || "Failed to delete product from Meta");
    }

    return res.data;
  }

  /**
   * Fetch Business Portfolios (BAs) owned by the business account.
   */
  async getBusinessPortfolios(tenantId: string) {
    const account = await this.whatsappAccountRepo.findOneBy({ tenantId });
    if (!account || !account.wabaId) throw new BadRequestException("WhatsApp account not fully connected");

    const token = this.resolveAccessToken(account);
    const apiVersion = await this.getApiVersion();

    // We fetch portfolios via the businesses edge of the user/system user
    // For simplicity, we can fetch from the WABA owner or use the business_id if we have it
    const bizId = account.businessId || account.wabaId; // Fallback to WABA ID if biz ID not saved
    
    const res = await this.callMetaApi(
      `https://graph.facebook.com/${apiVersion}/${bizId}/owned_businesses?access_token=${token}`,
      { method: "GET" }
    );

    return res.data?.data || [];
  }

  /**
   * Create a new Product Catalog in Meta.
   */
  async createMetaCatalog(tenantId: string, name: string, vertical = "COMMERCE") {
    const account = await this.whatsappAccountRepo.findOneBy({ tenantId, status: "connected" });
    if (!account || !account.businessId) throw new BadRequestException("Business ID missing for this account");

    const token = this.resolveAccessToken(account);
    const apiVersion = await this.getApiVersion();

    const res = await this.callMetaApi(
      `https://graph.facebook.com/${apiVersion}/${account.businessId}/owned_product_catalogs?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          vertical,
        }),
      }
    );

    if (!res.ok) {
      throw new BadRequestException(res.data.error?.message || "Failed to create Meta Catalog");
    }

    return res.data;
  }

  /**
   * Update WhatsApp Commerce Settings (Link Catalog, Toggle Visibility).
   */
  async updateCommerceSettings(tenantId: string, settings: { catalog_id?: string; is_catalog_visible?: boolean; is_cart_enabled?: boolean }) {
    const account = await this.whatsappAccountRepo.findOneBy({ tenantId, status: "connected" });
    if (!account || !account.phoneNumberId) throw new BadRequestException("Phone Number ID missing");

    const token = this.resolveAccessToken(account);
    const apiVersion = await this.getApiVersion();

    const res = await this.callMetaApi(
      `https://graph.facebook.com/${apiVersion}/${account.phoneNumberId}/whatsapp_commerce_settings?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }
    );

    if (!res.ok) {
      throw new BadRequestException(res.data.error?.message || "Failed to update commerce settings");
    }

    return res.data;
  }

  /**
   * Sync multiple products to Meta using the items_batch endpoint.
   */
  async pushItemsBatch(tenantId: string, catalogId: string, requests: any[]) {
    const account = await this.whatsappAccountRepo.findOneBy({ tenantId });
    if (!account) throw new BadRequestException("Account not found");

    const token = this.resolveAccessToken(account);
    const apiVersion = await this.getApiVersion();

    const res = await this.callMetaApi(
      `https://graph.facebook.com/${apiVersion}/${catalogId}/items_batch?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requests }),
      }
    );

    if (!res.ok) {
      throw new BadRequestException(res.data.error?.message || "Batch sync failed");
    }

    return res.data;
  }
}
