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

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
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
            feature: "whatsapp_business_app_onboarding",
            sessionInfoVersion: "3",
          }
        : {
            // Cloud onboarding provisions direct Cloud API flow.
            feature: "whatsapp_embedded_signup",
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
            return { connected: false, ...account };
          }
        }
      } catch (error) {
        this.logger.error(`Status probe failed for tenant ${tenantId}:`, error);
      }
    }

    return { connected: account.status === "connected", ...account };
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
    return response.data.data || [];
  }

  async createFlow(tenantId: string, name: string, categories: string[], initialCanvas?: any) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();
    const normalizedName = this.normalizeFlowName(name);
    const normalizedCategories = this.normalizeFlowCategories(categories);

    // Atomic Creation: Prepare flow_json directly
    const flowJson = initialCanvas ? this.generateMetaFlowJson(initialCanvas) : {
      version: "3.1",
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

    const result = await this.callMetaApi(
      `https://graph.facebook.com/${apiVersion}/${creds.wabaId}/flows?access_token=${creds.accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            name: normalizedName, 
            categories: normalizedCategories,
            flow_json: JSON.stringify(flowJson)
        }),
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
      status: AutomationStatus.ACTIVE,
      triggerConfig: { canvas: initialCanvas || { nodes: [], edges: [] } }
    });
    await this.automationFlowRepo.save(newFlow);

    return result.data;
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

    // Use Buffer for Node.js compatibility with Meta API
    const fileBuffer = Buffer.from(JSON.stringify(json));
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: "application/json" });
    
    formData.append("file", blob, filename);
    formData.append("name", filename);
    formData.append("asset_type", "FLOW_JSON");

    const url = `https://graph.facebook.com/${apiVersion}/${flowId}/assets?access_token=${creds.accessToken}`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      this.logger.error(`Meta Asset Upload Failed for flow ${flowId}:`, JSON.stringify(data));
      throw new BadRequestException(data.error?.message || "Asset upload failed");
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

    const response = await this.callMetaApi(`https://graph.facebook.com/${apiVersion}/${flowId}?access_token=${creds.accessToken}`, { method: "DELETE" });
    if (!response.ok) throw new BadRequestException(response.data.error?.message || "Delete failed");
    return { success: true };
  }

  async publishFlow(tenantId: string, flowId: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${flowId}/publish?access_token=${creds.accessToken}`, { method: "POST" });
    const data = await response.json();
    
    if (!response.ok) {
      this.logger.error(`Meta Flow Publish Failed for ${flowId}:`, JSON.stringify(data));
      throw new BadRequestException(data.error?.message || "Publish failed. Check flow structure and IDs.");
    }
    
    return { success: true };
  }

  async deprecateFlow(tenantId: string, flowId: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${flowId}/deprecate?access_token=${creds.accessToken}`, { method: "POST" });
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

    const res = await fetch(`https://graph.facebook.com/${apiVersion}/${flowId}/assets?access_token=${creds.accessToken}`);
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
    let flow = await this.automationFlowRepo.findOne({ where: { remoteId: flowId, tenantId } });
    
    if (!flow) {
      // Fallback: search by ID if it's our internal UUID
      flow = await this.automationFlowRepo.findOne({ where: { id: flowId, tenantId } });
    }

    if (!flow) throw new BadRequestException("Flow record not found");

    flow.name = payload.name;
    flow.triggerConfig = { ...flow.triggerConfig, canvas: payload.flowData };
    
    // Also update Meta flow.json via logic
    try {
       const flowJson = this.generateMetaFlowJson(payload.flowData);
       await this.uploadFlowAsset(tenantId, flowId, "flow.json", flowJson);
    } catch (err) {
       this.logger.error("Failed to auto-upload flow.json asset on save", err);
    }

    await this.automationFlowRepo.save(flow);
    return { success: true };
  }

  async getFlowCanvas(tenantId: string, flowId: string) {
    const flow = await this.automationFlowRepo.findOne({ 
      where: [
        { remoteId: flowId, tenantId },
        { id: flowId, tenantId }
      ]
    });
    if (!flow) throw new BadRequestException("Flow not found");
    return flow.triggerConfig?.canvas || { nodes: [], edges: [] };
  }

  private generateMetaFlowJson(canvas: any) {
    const nodes = canvas?.nodes || [];
    const edges = canvas?.edges || [];
    
    if (nodes.length === 0) {
      return {
        version: "3.1",
        screens: [{
          id: "WELCOME_SCREEN",
          title: "Welcome",
          terminal: true,
          layout: {
            type: "SingleColumnLayout",
            children: [{ type: "TextHeading", text: "Welcome" }]
          }
        }]
      };
    }

    const screens = nodes.map((node: any) => {
      const data = node.data || {};
      const children: any[] = [];

      // Map components based on node type
      if (node.type === 'wa_text') {
        children.push({ type: "TextBody", text: data.text || "Hello" });
      } else if (node.type === 'wa_question') {
        children.push({ type: "TextBody", text: data.questionText || "Please answer:" });
        children.push({
          type: "TextInput",
          label: "Your Response",
          name: data.questionSaveAs || "response",
          required: true
        });
      } else if (node.type === 'wa_mcq') {
        children.push({ type: "TextBody", text: data.mcqBody || "Select an option:" });
        children.push({
          type: "RadioButtons",
          label: "Options",
          name: "mcq_selection",
          options: (data.mcqOptions || []).map((o: any) => ({
            id: o.id,
            title: o.title
          }))
        });
      }

      // Handle next screen navigation based on edges
      const outboundEdges = edges.filter((e: any) => e.source === node.id);
      const isTerminal = outboundEdges.length === 0 || node.type === 'wa_end';

      const footer: any = {
        type: "Footer",
        label: isTerminal ? "Complete" : "Next"
      };

      if (isTerminal) {
        footer["on-click-action"] = {
          name: "complete",
          payload: { status: "success" }
        };
      } else {
        // Multi-choice handling usually goes into specific button actions, 
        // but for a simple linear flow we take the first edge.
        const nextNodeId = outboundEdges[0].target;
        footer["on-click-action"] = {
          name: "navigate",
          next_screen: nextNodeId
        };
      }

      children.push(footer);

      return {
        id: node.id,
        title: (data.label || "Screen").slice(0, 20),
        terminal: isTerminal,
        layout: {
          type: "SingleColumnLayout",
          children
        }
      };
    });

    return {
      version: "3.1",
      screens
    };
  }
}
