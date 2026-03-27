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
import { AutomationService } from "@api/automation/automation.service";
import { AiService } from "@api/ai/ai.service";
import { MessagesGateway } from "@api/messages/messages.gateway";
import { WorkflowsService } from "@api/automation/workflows.service";

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
    @InjectQueue("whatsapp-webhooks")
    private webhookQueue: Queue,
    private automationService: AutomationService,
    private workflowsService: WorkflowsService,
    private aiService: AiService,
    private messagesGateway: MessagesGateway,
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
      this.logger.log(`Found account for PhoneID: ${phoneNumberId}, TenantID: ${account.tenantId}`);

      let contact = await this.contactRepo.findOneBy({
        tenantId: account.tenantId,
        phoneNumber: from,
      });

      if (!contact) {
        this.logger.log(`Contact not found for ${from}, creating...`);
        const profileName = value.contacts?.[0]?.profile?.name || "Unknown";
        contact = this.contactRepo.create({
          tenantId: account.tenantId,
          phoneNumber: from,
          name: profileName,
        });
        await this.contactRepo.save(contact);
        this.logger.log(`Contact created: ${contact.id}`);
      } else {
        this.logger.log(`Found contact: ${contact.id}`);
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
        this.logger.log(`Conversation not found for contact ${contact.id}, creating...`);
        conversation = this.conversationRepo.create({
          tenantId: account.tenantId,
          contactId: contact.id,
          phoneNumberId: phoneNumberId,
          status: "open",
          lastMessageAt: new Date(),
          firstInboundAt: new Date(),  // Track 24h window start
          aiMode: 'ai',  // Start in AI mode by default
        });
        await this.conversationRepo.save(conversation);
        this.logger.log(`Conversation created: ${conversation.id}`);
      } else {
        this.logger.log(`Found open conversation: ${conversation.id}`);
        conversation.lastMessageAt = new Date();
        // Record first inbound time if not yet set
        if (!conversation.firstInboundAt) {
          conversation.firstInboundAt = new Date();
        }
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

      this.logger.log(`Attempting to save message with MetaID: ${messageData.id}`);
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
      this.logger.log(`Message saved successfully: ${message.id}`);

      // Handle WhatsApp Flow Responses (nfm_reply)
      if (messageData.type === 'interactive' && messageData.interactive?.type === 'nfm_reply') {
        const flowReply = messageData.interactive.nfm_reply;
        try {
          const responseJson = JSON.parse(flowReply.response_json || '{}');
          this.logger.log(`WhatsApp Flow reply received for contact ${contact.id}: ${JSON.stringify(responseJson)}`);

          // Update contact attributes
          contact.attributes = {
            ...(contact.attributes || {}),
            ...responseJson
          };
          await this.contactRepo.save(contact);

          // Trigger flow_response workflow
          await this.workflowsService.executeTrigger(
            account.tenantId,
            "flow_response",
            {
              from,
              contactId: contact.id,
              conversationId: conversation.id,
              flowResponse: responseJson
            }
          );
        } catch (e: any) {
          this.logger.error(`Failed to parse WhatsApp Flow response: ${flowReply.response_json}`, e.stack);
        }
      }


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
          conversationId: conversation.id,  // Pass conversationId for handoff checks
        },
      );

      // Legacy fallback: keyword-based automation rules
      const automationHandled = await this.automationService.evaluate(
        account.tenantId,
        from,
        messageData.text?.body || "",
      );

      // ─── AI Fallback ─────────────────────────────────────────────────────
      // Only trigger AI if:
      // 1. Message is a text message
      // 2. No keyword automation rule handled it
      // 3. Conversation is in 'ai' mode (not 'human' or 'paused')
      // 4. AI pause hasn't expired yet
      if (!automationHandled && messageData.text?.body) {
        const aiMode = conversation.aiMode || 'ai';
        const now = new Date();
        const pauseExpired = !conversation.aiPausedUntil || conversation.aiPausedUntil <= now;

        if (aiMode === 'ai' || (aiMode === 'paused' && pauseExpired)) {
          if (aiMode === 'paused' && pauseExpired) {
            // Auto-resume AI after pause expires
            conversation.aiMode = 'ai';
            conversation.aiPausedUntil = null;
            await this.conversationRepo.save(conversation);
            this.logger.log(`AI pause expired for conversation ${conversation.id}, resuming AI`);
          }

          this.logger.log(`Triggering AI for conversation ${conversation.id}, mode: ${aiMode}`);
          await this.aiService.process(
            account.tenantId,
            from,
            messageData.text.body
          );
        } else {
          this.logger.log(`AI skipped for conversation ${conversation.id}: mode=${aiMode}, pausedUntil=${conversation.aiPausedUntil}`);
        }
      }
    }

    if (value?.statuses) {
      const statusUpdate = value.statuses[0];
      const metaMessageId = statusUpdate.id;
      const newStatus = statusUpdate.status;

      const message = await this.messageRepo.findOne({
        where: { metaMessageId },
      });

      if (message) {
        message.status = newStatus;
        await this.messageRepo.save(message);

        this.messagesGateway.emitMessageStatus(message.tenantId, {
          messageId: message.id,
          metaMessageId,
          status: newStatus,
          timestamp: new Date(),
        });
      }
    }

    // --- COEXISTENCE: Handle Message Echoes (Messages from App) ---
    if (changes?.field === "smb_message_echoes" && value?.message_echoes) {
      for (const echo of value.message_echoes) {
        const phoneNumberId = value.metadata?.phone_number_id;
        const recipient = echo.to;

        const account = await this.whatsappAccountRepo.findOneBy({ phoneNumberId });
        if (!account) continue;

        let contact = await this.contactRepo.findOneBy({
          tenantId: account.tenantId,
          phoneNumber: recipient,
        });

        if (!contact) {
          contact = this.contactRepo.create({
            tenantId: account.tenantId,
            phoneNumber: recipient,
            name: "Unknown (App Sync)",
          });
          await this.contactRepo.save(contact);
        }

        let conversation = await this.conversationRepo.findOne({
          where: { tenantId: account.tenantId, contactId: contact.id, status: "open" },
        });

        if (!conversation) {
          conversation = this.conversationRepo.create({
            tenantId: account.tenantId,
            contactId: contact.id,
            phoneNumberId,
            status: "open",
            lastMessageAt: new Date(),
          });
          await this.conversationRepo.save(conversation);
        }

        const messageContent = echo[echo.type] || {};
        const message = this.messageRepo.create({
          tenantId: account.tenantId,
          conversationId: conversation.id,
          direction: "out",
          type: echo.type,
          content: messageContent,
          metaMessageId: echo.id,
          status: "delivered",
        });

        await this.messageRepo.save(message);

        this.messagesGateway.emitNewMessage(account.tenantId, {
          conversationId: conversation.id,
          contactId: contact.id,
          phone: recipient,
          direction: "out",
          type: echo.type,
          content: messageContent,
          timestamp: new Date(echo.timestamp * 1000),
        });
      }
    }

    // --- COEXISTENCE: Handle Contact State Sync ---
    if (changes?.field === "smb_app_state_sync" && value?.state_sync) {
      for (const sync of value.state_sync) {
        if (sync.type === "contact") {
          const phoneNumberId = value.metadata?.phone_number_id;
          const account = await this.whatsappAccountRepo.findOneBy({ phoneNumberId });
          if (!account) continue;

          const { full_name, first_name, phone_number } = sync.contact;

          if (sync.action === "add") {
            let contact = await this.contactRepo.findOneBy({
              tenantId: account.tenantId,
              phoneNumber: phone_number,
            });

            if (contact) {
              contact.name = full_name || contact.name;
              await this.contactRepo.save(contact);
            } else {
              contact = this.contactRepo.create({
                tenantId: account.tenantId,
                phoneNumber: phone_number,
                name: full_name || first_name || "Unknown",
              });
              await this.contactRepo.save(contact);
            }
          } else if (sync.action === "remove") {
            await this.contactRepo.delete({
              tenantId: account.tenantId,
              phoneNumber: phone_number,
            });
          }
        }
      }
    }

    return { status: "success" };
  }
}
