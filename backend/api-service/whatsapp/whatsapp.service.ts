import { Injectable, BadRequestException } from "@nestjs/common";
import * as qs from "querystring";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { WhatsappAccount } from "./entities/whatsapp-account.entity";
import { RedisService } from "@shared/redis.service";
import { EncryptionService } from "@shared/encryption.service";
import { AdminConfigService } from "../admin/services/admin-config.service";

@Injectable()
export class WhatsappService {
  constructor(
    private configService: ConfigService,
    private adminConfigService: AdminConfigService,
    @InjectRepository(WhatsappAccount)
    private whatsappAccountRepo: Repository<WhatsappAccount>,
    @InjectQueue("whatsapp-messages")
    private messageQueue: Queue,
    private redisService: RedisService,
    private encryptionService: EncryptionService,
  ) {}

  async getEmbeddedSignupUrl(tenantId: string) {
    const appId = await this.adminConfigService.getConfigValue("meta.app_id");
    const redirectUri =
      await this.adminConfigService.getConfigValue("meta.redirect_uri");
    const apiVersion =
      (await this.adminConfigService.getConfigValue("meta.api_version")) ||
      "v21.0";

    const params = qs.stringify({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: [
        "whatsapp_business_management",
        "whatsapp_business_messaging",
        "business_management",
      ].join(","),
      response_type: "code",
      state: tenantId,
    });

    return `https://www.facebook.com/${apiVersion}/dialog/oauth?${params}`;
  }
  async getCredentials(tenantId: string) {
    const cacheKey = `whatsapp:token:${tenantId}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const account = await this.whatsappAccountRepo.findOne({
      where: { tenantId },
    });
    if (!account) return null;

    const credentials = {
      wabaId: account.wabaId,
      phoneNumberId: account.phoneNumberId,
      accessToken: this.encryptionService.decrypt(account.accessToken),
    };

    // Cache for 1 hour
    await this.redisService.set(cacheKey, JSON.stringify(credentials), 3600);

    return credentials;
  }

  async getStatus(tenantId: string) {
    const account = await this.whatsappAccountRepo.findOne({
      where: { tenantId },
    });
    if (!account) return { connected: false };

    return {
      connected: account.status === "connected",
      mode: account.mode,
      phoneNumber: account.displayPhoneNumber,
      wabaId: account.wabaId,
      qualityRating: account.qualityRating,
    };
  }

  async getPublicConfig() {
    return {
      appId: await this.adminConfigService.getConfigValue("meta.app_id"),
      configId: await this.adminConfigService.getConfigValue("meta.config_id"),
      redirectUri:
        await this.adminConfigService.getConfigValue("meta.redirect_uri"),
    };
  }

  async disconnect(tenantId: string) {
    return this.whatsappAccountRepo.delete({ tenantId });
  }

  async sendTestMessage(tenantId: string, to: string) {
    const credentials = await this.getCredentials(tenantId);
    if (!credentials || !credentials.accessToken) {
      throw new BadRequestException(
        "WhatsApp account not connected for this tenant",
      );
    }

    const payload = {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: "hello_world",
        language: {
          code: "en_US",
        },
      },
    };

    // Enqueue with minimal data. Processor will re-fetch (and use cache)
    await this.messageQueue.add(
      "send-test",
      {
        tenantId,
        to,
        payload,
      },
      {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    );

    return { success: true, message: "Message enqueued for delivery" };
  }

  async getAccountDetails(tenantId: string) {
    const account = await this.whatsappAccountRepo.findOne({
      where: { tenantId },
    });

    if (!account) {
      throw new BadRequestException("WhatsApp account not connected");
    }

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
    const account = await this.whatsappAccountRepo.findOne({
      where: { tenantId },
    });

    if (!account) {
      throw new BadRequestException("WhatsApp account not connected");
    }

    const accessToken = this.encryptionService.decrypt(account.accessToken);
    const apiVersion =
      (await this.adminConfigService.getConfigValue("meta.api_version")) ||
      "v21.0";

    try {
      // Fetch phone number details from Meta Graph API
      const phoneResponse = await fetch(
        `https://graph.facebook.com/${apiVersion}/${account.phoneNumberId}?fields=verified_name,display_phone_number,quality_rating,messaging_limit_tier&access_token=${accessToken}`,
      );

      if (!phoneResponse.ok) {
        throw new BadRequestException(
          "Failed to fetch phone number details from Meta",
        );
      }

      const phoneData = await phoneResponse.json();

      // Fetch WABA details
      const wabaResponse = await fetch(
        `https://graph.facebook.com/${apiVersion}/${account.wabaId}?fields=id,name,timezone_id,message_template_namespace,account_review_status&access_token=${accessToken}`,
      );

      if (!wabaResponse.ok) {
        throw new BadRequestException("Failed to fetch WABA details from Meta");
      }

      const wabaData = await wabaResponse.json();

      // Update account with fresh data
      await this.whatsappAccountRepo.update(
        { tenantId },
        {
          verifiedName: phoneData.verified_name,
          displayPhoneNumber: phoneData.display_phone_number,
          qualityRating: phoneData.quality_rating,
          messagingLimit: phoneData.messaging_limit_tier,
          lastSyncedAt: new Date(),
        },
      );

      // Clear cache
      await this.redisService.del(`whatsapp:token:${tenantId}`);

      return {
        success: true,
        message: "Account synced successfully",
        data: {
          verifiedName: phoneData.verified_name,
          displayPhoneNumber: phoneData.display_phone_number,
          qualityRating: phoneData.quality_rating,
          messagingLimit: phoneData.messaging_limit_tier,
          wabaName: wabaData.name,
          accountReviewStatus: wabaData.account_review_status,
        },
      };
    } catch (error) {
      console.error("Error syncing account from Meta:", error);
      throw new BadRequestException(
        "Failed to sync account. Please check your connection and try again.",
      );
    }
  }

  async getFlows(tenantId: string) {
    const account = await this.whatsappAccountRepo.findOne({
      where: { tenantId },
    });

    if (!account) {
      throw new BadRequestException("WhatsApp account not connected");
    }

    const accessToken = this.encryptionService.decrypt(account.accessToken);
    const apiVersion =
      (await this.adminConfigService.getConfigValue("meta.api_version")) ||
      "v21.0";

    try {
      const response = await fetch(
        `https://graph.facebook.com/${apiVersion}/${account.wabaId}/flows?fields=id,name,status,updated_at&access_token=${accessToken}`,
      );

      if (!response.ok) {
        throw new BadRequestException("Failed to fetch flows from Meta");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching flows from Meta:", error);
      throw new BadRequestException("Failed to fetch flows. Please try again.");
    }
  }

  async createFlow(tenantId: string, name: string, categories: string[]) {
    const account = await this.whatsappAccountRepo.findOne({
      where: { tenantId },
    });

    if (!account) {
      throw new BadRequestException("WhatsApp account not connected");
    }

    const accessToken = this.encryptionService.decrypt(account.accessToken);
    const apiVersion =
      (await this.adminConfigService.getConfigValue("meta.api_version")) ||
      "v21.0";

    try {
      const response = await fetch(
        `https://graph.facebook.com/${apiVersion}/${account.wabaId}/flows?access_token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            categories,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new BadRequestException(
          data.error?.message || "Failed to create flow in Meta",
        );
      }

      // Automatically upload a default "Hello World" asset
      try {
        await this.uploadFlowAsset(tenantId, data.id, name);
      } catch (uploadError) {
        console.error("Error uploading default flow asset:", uploadError);
        // We don't throw here as the flow is already created,
        // but it will be in a state with no screens.
      }

      return data;
    } catch (error) {
      console.error("Error creating flow in Meta:", error);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException("Failed to create flow. Please try again.");
    }
  }

  async uploadFlowAsset(tenantId: string, flowId: string, flowName: string) {
    const account = await this.whatsappAccountRepo.findOne({
      where: { tenantId },
    });
    if (!account) return;

    const accessToken = this.encryptionService.decrypt(account.accessToken);
    const apiVersion = (await this.adminConfigService.getConfigValue("meta.api_version")) || "v21.0";

    const flowJson = {
      version: "5.0",
      screens: [
        {
          id: "WELCOME",
          title: "Welcome",
          terminal: true,
          data: {},
          layout: {
            type: "SingleColumnLayout",
            children: [
              {
                type: "TextHeading",
                text: flowName || "Welcome"
              },
              {
                type: "TextBody",
                text: "This is an automated preview of your flow."
              },
              {
                type: "Footer",
                label: "Complete",
                "on-click-action": {
                  "name": "complete",
                  "payload": {}
                }
              }
            ]
          }
        }
      ]
    };

    const formData = new FormData();
    const blob = new Blob([JSON.stringify(flowJson)], { type: "application/json" });
    formData.append("file", blob, "flow.json");
    formData.append("name", "flow.json");
    formData.append("asset_type", "FLOW_JSON");

    try {
      const response = await axios.post(
        `https://graph.facebook.com/${apiVersion}/${flowId}/assets?access_token=${accessToken}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Meta Flow Asset Upload Error:", error.response?.data || error.message);
      throw new BadRequestException("Failed to upload flow asset to Meta");
    }
  }

  async deleteFlow(tenantId: string, flowId: string) {
    const account = await this.whatsappAccountRepo.findOne({
      where: { tenantId },
    });
    if (!account) throw new BadRequestException("WhatsApp account not connected");

    const accessToken = this.encryptionService.decrypt(account.accessToken);
    const apiVersion = (await this.adminConfigService.getConfigValue("meta.api_version")) || "v21.0";

    try {
      const response = await fetch(
        `https://graph.facebook.com/${apiVersion}/${flowId}?access_token=${accessToken}`,
        { method: "DELETE" }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new BadRequestException(data.error?.message || "Failed to delete flow in Meta");
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting flow in Meta:", error);
      throw error instanceof BadRequestException ? error : new BadRequestException("Failed to delete flow");
    }
  }

  async publishFlow(tenantId: string, flowId: string) {
    const account = await this.whatsappAccountRepo.findOne({
      where: { tenantId },
    });
    if (!account) throw new BadRequestException("WhatsApp account not connected");

    const accessToken = this.encryptionService.decrypt(account.accessToken);
    const apiVersion = (await this.adminConfigService.getConfigValue("meta.api_version")) || "v21.0";

    try {
      const response = await fetch(
        `https://graph.facebook.com/${apiVersion}/${flowId}/publish?access_token=${accessToken}`,
        { method: "POST" }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new BadRequestException(data.error?.message || "Failed to publish flow. Ensure it has valid assets.");
      }

      return { success: true, status: data.status };
    } catch (error) {
      console.error("Error publishing flow in Meta:", error);
      throw error instanceof BadRequestException ? error : new BadRequestException("Failed to publish flow");
    }
  }

  async getFlowAssets(tenantId: string, flowId: string) {
    const account = await this.whatsappAccountRepo.findOne({
      where: { tenantId },
    });
    if (!account) throw new BadRequestException("WhatsApp account not connected");

    const accessToken = this.encryptionService.decrypt(account.accessToken);
    const apiVersion = (await this.adminConfigService.getConfigValue("meta.api_version")) || "v21.0";

    try {
      // First get the list of assets
      const assetsResponse = await fetch(
        `https://graph.facebook.com/${apiVersion}/${flowId}/assets?access_token=${accessToken}`
      );
      const assetsData = await assetsResponse.json();
      
      if (!assetsResponse.ok || !assetsData.data?.[0]) {
        throw new BadRequestException("No assets found for this flow");
      }

      // Usually the first asset is the flow.json
      const assetId = assetsData.data[0].id;
      const downloadResponse = await fetch(
        `https://graph.facebook.com/${apiVersion}/${assetId}?fields=download_url&access_token=${accessToken}`
      );
      const downloadData = await downloadResponse.json();

      if (!downloadResponse.ok || !downloadData.download_url) {
        throw new BadRequestException("Failed to get download URL for flow asset");
      }

      const flowContentResponse = await fetch(downloadData.download_url);
      return await flowContentResponse.json();
    } catch (error) {
      console.error("Error fetching flow assets:", error);
      throw error instanceof BadRequestException ? error : new BadRequestException("Failed to fetch flow assets");
    }
  }
}
