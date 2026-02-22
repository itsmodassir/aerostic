import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { WhatsappAccount } from "../whatsapp/entities/whatsapp-account.entity";
import { Contact } from "@shared/database/entities/core/contact.entity";
import { Conversation } from "@shared/database/entities/messaging/conversation.entity";
import { Message } from "@shared/database/entities/messaging/message.entity";
import { Campaign } from "../campaigns/entities/campaign.entity";
import { WalletService } from "../billing/wallet.service";
import { WalletAccountType } from "@shared/database/entities/billing/wallet-account.entity";
import { TransactionType } from "@shared/database/entities/billing/wallet-transaction.entity";
import { AutomationService } from "../automation/automation.service";
import { AiService } from "../ai/ai.service";
import { MessagesGateway } from "../messages/messages.gateway";
import { WorkflowsService } from "../automation/workflows.service";
import { AdminConfigService } from "../admin/services/admin-config.service";

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(WhatsappAccount)
    private whatsappAccountRepo: Repository<WhatsappAccount>,
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(Campaign)
    private campaignRepo: Repository<Campaign>,
    @InjectQueue("whatsapp-webhooks")
    private webhookQueue: Queue,
    private automationService: AutomationService,
    private workflowsService: WorkflowsService,
    private aiService: AiService,
    private messagesGateway: MessagesGateway,
    private walletService: WalletService,
    private adminConfigService: AdminConfigService,
  ) { }

  verifyWebhook(mode: string, token: string, challenge: string): string {
    const verifyToken = this.configService.get("META_WEBHOOK_VERIFY_TOKEN");

    if (mode === "subscribe" && token === verifyToken) {
      return challenge;
    }
    throw new Error("Invalid verification criteria");
  }

  async processWebhook(body: any) {
    await this.webhookQueue.add(
      "process-event",
      { body },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    );

    return { status: "enqueued" };
  }

  verifySignature(rawBody: string, signature: string): boolean {
    const appSecret = this.configService.get("META_APP_SECRET");
    if (!appSecret) {
      this.logger.error("META_APP_SECRET not configured");
      return false;
    }

    try {
      const [algo, hash] = signature.split("=");
      if (algo !== "sha256") return false;

      const expectedHash = crypto
        .createHmac("sha256", appSecret)
        .update(rawBody)
        .digest("hex");

      return hash === expectedHash;
    } catch (error) {
      this.logger.error("Error verifying signature:", error);
      return false;
    }
  }

  async handleProcessedPayload(body: any) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.messages) {
      const messageData = value.messages[0];
      const phoneNumberId = value.metadata?.phone_number_id;
      const from = messageData.from;

      const account = await this.whatsappAccountRepo.findOneBy({
        phoneNumberId,
      });
      if (!account) {
        this.logger.error(`No tenant found for PhoneID: ${phoneNumberId}`);
        return;
      }

      let contact = await this.contactRepo.findOneBy({
        tenantId: account.tenantId,
        phoneNumber: from,
      });

      if (!contact) {
        const profileName = value.contacts?.[0]?.profile?.name || "Unknown";
        contact = this.contactRepo.create({
          tenantId: account.tenantId,
          phoneNumber: from,
          name: profileName,
        });
        await this.contactRepo.save(contact);
      }

      let conversation = await this.conversationRepo.findOne({
        where: {
          tenantId: account.tenantId,
          contactId: contact.id,
          status: "open",
        },
        order: { lastMessageAt: "DESC" },
      });

      if (!conversation) {
        conversation = this.conversationRepo.create({
          tenantId: account.tenantId,
          contactId: contact.id,
          phoneNumberId: phoneNumberId,
          status: "open",
          lastMessageAt: new Date(),
        });
        await this.conversationRepo.save(conversation);
      } else {
        conversation.lastMessageAt = new Date();
        await this.conversationRepo.save(conversation);
      }

      const existingMsg = await this.messageRepo.findOneBy({
        metaMessageId: messageData.id,
      });

      if (existingMsg) {
        this.logger.warn(
          `Duplicate message received: ${messageData.id}. Skipping.`,
        );
        return;
      }

      const messageContent = messageData[messageData.type] || {};
      const message = this.messageRepo.create({
        tenantId: account.tenantId,
        conversationId: conversation.id,
        direction: "in",
        type: messageData.type,
        content: messageContent,
        metaMessageId: messageData.id,
        status: "received",
      });

      await this.messageRepo.save(message);

      this.messagesGateway.emitNewMessage(account.tenantId, {
        conversationId: conversation.id,
        contactId: contact.id,
        phone: from,
        direction: "in",
        type: messageData.type,
        content: messageContent,
        timestamp: new Date(),
      });

      // 🔥 Trigger New Visual Automation Workflows
      await this.workflowsService.executeTrigger(
        account.tenantId,
        "new_message",
        {
          from,
          messageBody: messageData.text?.body || "",
          contactId: contact.id,
        },
      );

      // Legacy fallback
      await this.automationService.evaluate(
        account.tenantId,
        from,
        messageData.text?.body || "",
      );
    }

    if (value?.statuses) {
      const statusUpdate = value.statuses[0];
      const metaMessageId = statusUpdate.id;
      const newStatus = statusUpdate.status;

      const message = await this.messageRepo.findOne({
        where: { metaMessageId },
      });

      if (message) {
        // Prevent double counting if status comes out of order
        const wasDelivered = message.status === "delivered" || message.status === "read";
        const wasRead = message.status === "read";
        const wasFailed = message.status === "failed";

        message.status = newStatus;
        await this.messageRepo.save(message);

        // Update Campaign Analytics
        if (message.campaignId) {
          if (newStatus === "delivered" && !wasDelivered && !wasFailed) {
            await this.campaignRepo.increment({ id: message.campaignId }, "deliveredCount", 1);
          } else if (newStatus === "read" && !wasRead && !wasFailed) {
            await this.campaignRepo.increment({ id: message.campaignId }, "readCount", 1);
          } else if (newStatus === "failed" && !wasFailed) {
            await this.campaignRepo.increment({ id: message.campaignId }, "failedCount", 1);
          }
        }

        // Issue Refund for Failed Templates
        if (newStatus === "failed" && message.type === "template" && !wasFailed) {
          try {
            const rateStr = await this.adminConfigService.getConfigValue(
              "whatsapp.template_rate_inr",
              message.tenantId
            );
            const templateRate = parseFloat(rateStr || "0.80");

            await this.walletService.processTransaction(
              message.tenantId,
              WalletAccountType.MAIN_BALANCE,
              templateRate,
              TransactionType.CREDIT,
              {
                referenceType: "TEMPLATE_MESSAGE_REFUND",
                referenceId: metaMessageId,
                description: `Refund for failed template delivery`,
              }
            );
          } catch (refundError) {
            this.logger.error("Failed to process refund for rejected template message", refundError);
          }
        }

        this.messagesGateway.emitMessageStatus(message.tenantId, {
          messageId: message.id,
          metaMessageId,
          status: newStatus,
          timestamp: new Date(),
        });
      }
    }

    return { status: "success" };
  }
}
