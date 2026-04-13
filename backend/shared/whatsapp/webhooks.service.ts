import { Injectable, Logger } from "@nestjs/common";
import { Not, IsNull } from "typeorm";
import * as crypto from "crypto";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { WhatsappAccount } from "./entities/whatsapp-account.entity";
import { Contact } from "../database/entities/core/contact.entity";
import { Conversation } from "../database/entities/messaging/conversation.entity";
import { Message } from "../database/entities/messaging/message.entity";
import { Campaign } from "../../api-service/campaigns/entities/campaign.entity";
import { Order } from "../database/entities/commerce/order.entity";
import { OrderItem } from "../database/entities/commerce/order-item.entity";
import { CatalogProduct } from "../database/entities/commerce/catalog-product.entity";
import { AiService } from "../../api-service/ai/ai.service";
import { forwardRef, Inject } from "@nestjs/common";
import { MessagesGateway } from "../../api-service/messages/messages.gateway";

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
    @Inject(forwardRef(() => AiService))
    private aiService: AiService,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(CatalogProduct)
    private catalogProductRepo: Repository<CatalogProduct>,
    @Inject(forwardRef(() => MessagesGateway))
    private messagesGateway: MessagesGateway,
  ) {}

  verifyWebhook(mode: string, token: string, challenge: string): string {
    const verifyToken = this.configService.get("META_WEBHOOK_VERIFY_TOKEN");
    if (mode === "subscribe" && token === verifyToken) {
      return challenge;
    }
    throw new Error("Invalid verification criteria");
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

  async enqueuePayload(body: any) {
    await this.webhookQueue.add(
      "process-event",
      { body },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
      },
    );
    return { status: "enqueued" };
  }

  async handleProcessedPayload(body: any) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const entryWabaId = entry?.id ? String(entry.id) : undefined;

    if (!value) return;

    // 1. Handle Incoming Messages & Echoes
    if (value.messages || value.message_echoes) {
      await this.handleMessagesAndEchoes(value, entryWabaId);
    }

    // 2. Handle Status Updates
    if (value.statuses) {
      await this.handleStatusUpdates(value.statuses);
    }

    // 3. Handle Template Status and Billing
    if (changes.field === "message_template_status_update") {
      await this.handleTemplateStatus(value);
    }

    // 4. Handle SMB App State Sync (Coexistence Contacts)
    if (changes.field === "smb_app_state_sync") {
      await this.handleSMBStateSync(value);
    }

    // 5. Handle History Sync (Coexistence Messages)
    if (changes.field === "history") {
      await this.handleHistorySync(value);
    }
  }

  private async handleMessagesAndEchoes(value: any, entryWabaId?: string) {
    const phoneNumberId = value.metadata?.phone_number_id;
    let account = await this.whatsappAccountRepo.findOneBy({ phoneNumberId });

    // Fallback: during re-link/re-registration, Meta can rotate phone_number_id while WABA stays same.
    // If WABA matches exactly one connected tenant account, heal mapping automatically.
    if (!account && entryWabaId) {
      const byWaba = await this.whatsappAccountRepo.findOne({
        where: { wabaId: entryWabaId, status: "connected" },
      });
      if (byWaba) {
        this.logger.warn(
          `PhoneID mismatch detected for tenant ${byWaba.tenantId}. Healing ${byWaba.phoneNumberId} -> ${phoneNumberId}`,
        );
        byWaba.phoneNumberId = phoneNumberId;
        await this.whatsappAccountRepo.save(byWaba);
        account = byWaba;
      }
    }

    if (!account) {
      this.logger.error(
        `Account not found for PhoneID: ${phoneNumberId}${entryWabaId ? ` (WABA: ${entryWabaId})` : ""}`,
      );
      return;
    }

    const messages = value.messages || [];
    const echoes = value.message_echoes || [];

    // Process regular messages
    for (const msg of messages) {
      if (msg.type === "order") {
        await this.handleOrderMessage(account, msg);
      }
      await this.processIncomingMessage(account, msg, value.contacts?.[0]);
    }

    // Process echoes (sent from Business App)
    for (const echo of echoes) {
      await this.processMessageEcho(account, echo);
    }
  }

  private async processIncomingMessage(account: WhatsappAccount, msg: any, metaContact: any) {
    const from = msg.from;
    let contact = await this.contactRepo.findOneBy({ tenantId: account.tenantId, phoneNumber: from });

    if (!contact) {
      contact = this.contactRepo.create({
        tenantId: account.tenantId,
        phoneNumber: from,
        name: metaContact?.profile?.name || "Unknown",
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
        phoneNumberId: account.phoneNumberId,
        status: "open",
        lastMessageAt: new Date(),
        firstInboundAt: new Date(),
        lastInboundAt: new Date(),
        aiMode: "ai",
        unreadCount: 1,
      });
      await this.conversationRepo.save(conversation);
    } else {
      conversation.lastMessageAt = new Date();
      conversation.lastInboundAt = new Date();
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      await this.conversationRepo.save(conversation);
    }

    const existingMsg = await this.messageRepo.findOneBy({ metaMessageId: msg.id });
    if (existingMsg) return;

    const message = this.messageRepo.create({
      tenantId: account.tenantId,
      conversationId: conversation.id,
      direction: "in",
      type: msg.type,
      content: msg[msg.type] || {},
      metaMessageId: msg.id,
      status: "received",
    });

    const messageBody = this.extractMessageBody(msg);
    let handledByCampaignAi = false;

    // --- NEW: Campaign Conversion Attribution ---
    // If this is a reply to the last outbound message, or if we can track campaignId
    // For simplicity, let's look at the most recent outbound campaign message to this contact
    const lastCampaignMsg = await this.messageRepo.findOne({
        where: { 
            tenantId: account.tenantId, 
            conversationId: conversation.id, 
            direction: "out",
            campaignId: Not(IsNull()) 
        },
        order: { createdAt: "DESC" }
    });

    if (lastCampaignMsg) {
        message.campaignId = lastCampaignMsg.campaignId;
        // Increment Conversion Count on Campaign
        await this.campaignRepo.increment({ id: lastCampaignMsg.campaignId }, "conversionCount", 1);
        this.logger.log(`Campaign ${lastCampaignMsg.campaignId} conversion attributed to reply from ${from}`);

        // --- NEW: AI Auto-Reply for Campaigns ---
        if (messageBody) {
            handledByCampaignAi = true;
            // Trigger AI response in background
            this.aiService.processCampaignReply(
                account.tenantId,
                from,
                messageBody,
                lastCampaignMsg.campaignId
            ).catch(err => this.logger.error("AI Auto-reply failed", err));
        }
    }
    // --------------------------------------------

    await this.messageRepo.save(message);

    // 🔥 Real-time emit to Inbox
    this.messagesGateway.emitNewMessage(account.tenantId, {
      id: message.id,
      conversationId: conversation.id,
      contactId: contact.id,
      direction: "in",
      type: message.type,
      content: message.content,
      timestamp: message.createdAt || new Date(),
      status: "received"
    });

    await this.dispatchWorkflowTrigger(account, contact, conversation, msg);

    if (!handledByCampaignAi && messageBody) {
      this.triggerGeneralAiReply(account.tenantId, from, conversation, messageBody);
    }
  }

  private async processMessageEcho(account: WhatsappAccount, echo: any) {
    const existingMessage = echo?.id
      ? await this.messageRepo.findOne({
          where: { tenantId: account.tenantId, metaMessageId: echo.id },
        })
      : null;

    if (existingMessage) {
      existingMessage.status = "delivered";
      existingMessage.content = existingMessage.content || echo[echo.type] || {};
      await this.messageRepo.save(existingMessage);

      this.messagesGateway.emitMessageStatus(account.tenantId, {
        messageId: existingMessage.id,
        metaMessageId: existingMessage.metaMessageId,
        conversationId: existingMessage.conversationId,
        status: existingMessage.status,
        readAt: existingMessage.readAt || null,
      });
      return;
    }

    const recipient = echo.to;
    let contact = await this.contactRepo.findOneBy({ tenantId: account.tenantId, phoneNumber: recipient });
    if (!contact) {
      contact = this.contactRepo.create({
        tenantId: account.tenantId,
        phoneNumber: recipient,
        name: "Unknown (Synced)",
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
        phoneNumberId: account.phoneNumberId,
        status: "open",
        lastMessageAt: new Date(echo.timestamp * 1000),
      });
      await this.conversationRepo.save(conversation);
    }

    const message = this.messageRepo.create({
      tenantId: account.tenantId,
      conversationId: conversation.id,
      direction: "out",
      type: echo.type,
      content: echo[echo.type] || {},
      metaMessageId: echo.id,
      status: "delivered",
    });

    await this.messageRepo.save(message);

    this.messagesGateway.emitNewMessage(account.tenantId, {
      id: message.id,
      metaId: message.metaMessageId,
      conversationId: conversation.id,
      contactId: contact.id,
      direction: "out",
      type: message.type,
      content: message.content,
      timestamp: message.createdAt || new Date(),
      status: message.status,
    });
  }

  private async handleStatusUpdates(statuses: any[]) {
    for (const statusUpdate of statuses) {
      const msg = await this.messageRepo.findOne({ where: { metaMessageId: statusUpdate.id } });
      if (msg) {
        const oldStatus = msg.status;
        msg.status = statusUpdate.status;
        if (statusUpdate.status === "read" && !msg.readAt) {
            msg.readAt = new Date();
        }
        await this.messageRepo.save(msg);

        this.messagesGateway.emitMessageStatus(msg.tenantId, {
          messageId: msg.id,
          metaMessageId: msg.metaMessageId,
          conversationId: msg.conversationId,
          status: msg.status,
          readAt: msg.readAt || null,
        });

        // --- NEW: Campaign Stats Tracking ---
        if (msg.campaignId) {
            if (statusUpdate.status === "delivered" && oldStatus !== "delivered" && oldStatus !== "read") {
                await this.campaignRepo.increment({ id: msg.campaignId }, "deliveredCount", 1);
            } else if (statusUpdate.status === "read" && oldStatus !== "read") {
                await this.campaignRepo.increment({ id: msg.campaignId }, "readCount", 1);
                // Also count as delivered if we somehow missed that status
                if (oldStatus !== "delivered") {
                    await this.campaignRepo.increment({ id: msg.campaignId }, "deliveredCount", 1);
                }
            }
        }
        // -----------------------------------
      }
    }
  }

  private async handleTemplateStatus(value: any) {
    this.logger.log(`Template status update: ${value.event}`);
    // Logic for updating template status in DB (requires Template entity)
  }

  private async handleSMBStateSync(value: any) {
    const phoneNumberId = value.metadata?.phone_number_id;
    const account = await this.whatsappAccountRepo.findOneBy({ phoneNumberId });
    if (!account) return;

    const contactData = value.contact; // Meta payload structure for contact sync
    if (!contactData || !contactData.phone_number) return;

    this.logger.log(`SMB Sync: ${value.sync_type} contact ${contactData.phone_number}`);

    if (value.sync_type === "add") {
      let contact = await this.contactRepo.findOneBy({
        tenantId: account.tenantId,
        phoneNumber: contactData.phone_number,
      });

      if (!contact) {
        contact = this.contactRepo.create({
          tenantId: account.tenantId,
          phoneNumber: contactData.phone_number,
          name: contactData.full_name || contactData.first_name || "Unknown",
          attributes: {
            source: "whatsapp_coexistence",
            syncOrigin: "mobile_app",
            lastSyncedAt: new Date(),
          },
        });
      } else {
        // Enrich Name only if currently generic
        if (contact.name === "Unknown" || !contact.name) {
          contact.name = contactData.full_name || contactData.first_name || contact.name;
        }
        contact.attributes = {
          ...(contact.attributes || {}),
          source: "whatsapp_coexistence",
          syncOrigin: "mobile_app",
          lastSyncedAt: new Date(),
        };
      }
      await this.contactRepo.save(contact);
    }
  }

  private async handleHistorySync(value: any) {
    const phoneNumberId = value.metadata?.phone_number_id;
    const account = await this.whatsappAccountRepo.findOneBy({ phoneNumberId });
    if (!account) return;

    const messages = value.messages || [];
    this.logger.log(`Importing ${messages.length} historical messages for tenant ${account.tenantId}`);

    const syncedConversationIds = new Set<string>();

    for (const msg of messages) {
      const message = await this.processHistoricalMessage(account, msg);
      if (message?.conversationId) {
        syncedConversationIds.add(message.conversationId);
      }
    }

    // Insert system notification in each touched thread
    for (const conversationId of syncedConversationIds) {
      await this.messageRepo.save(
        this.messageRepo.create({
          tenantId: account.tenantId,
          conversationId,
          direction: "in",
          type: "system",
          body: "Conversation history imported from WhatsApp Business",
          status: "received",
          metadata: {
            source: "whatsapp_history_sync",
            isImported: true,
            isSystem: true,
          },
        }),
      );
    }
  }

  private async processHistoricalMessage(account: WhatsappAccount, msg: any): Promise<any> {
    const existingMsg = await this.messageRepo.findOneBy({ metaMessageId: msg.id });
    if (existingMsg) return;

    const from = msg.from || msg.to; // history might have both
    if (!from) return;

    // 1. Resolve Contact (Silent Import)
    let contact = await this.contactRepo.findOneBy({
      tenantId: account.tenantId,
      phoneNumber: from,
    });
    if (!contact) {
      contact = this.contactRepo.create({
        tenantId: account.tenantId,
        phoneNumber: from,
        name: "Unknown (Imported)",
      });
      await this.contactRepo.save(contact);
    }

    // 2. Resolve Conversation (Silent)
    let conversation = await this.conversationRepo.findOne({
      where: { tenantId: account.tenantId, contactId: contact.id, status: "open" },
    });
    if (!conversation) {
      conversation = this.conversationRepo.create({
        tenantId: account.tenantId,
        contactId: contact.id,
        phoneNumberId: account.phoneNumberId,
        status: "open",
        lastMessageAt: new Date(msg.timestamp * 1000),
      });
      await this.conversationRepo.save(conversation);
    }

    // 3. Persist Message with Historical Metadata
    const message = this.messageRepo.create({
      tenantId: account.tenantId,
      conversationId: conversation.id,
      direction: msg.from === account.displayPhoneNumber ? "out" : "in",
      type: msg.type || "text",
      content: msg[msg.type] || { body: msg.text?.body },
      metaMessageId: msg.id,
      status: "received",
      createdAt: new Date(msg.timestamp * 1000),
      metadata: {
        source: "whatsapp_history_sync",
        isImported: true,
        isHistorical: true,
        importedAt: new Date(),
        metaWebhookEventId: msg.id,
      },
    });

    await this.messageRepo.save(message);
    // Note: We EXPLICITLY do NOT emit to gateway, AI, or Workflows here.
    return message;
  }

  private resolveTriggerType(msg: any): string {
    if (msg?.type === "interactive") {
      const interactiveType = String(msg?.interactive?.type || "");
      if (interactiveType === "nfm_reply") {
        return "flow_response";
      }
      if (interactiveType === "button_reply" || interactiveType === "list_reply") {
        return "template_reply";
      }
    }
    return "new_message";
  }

  private extractMessageBody(msg: any): string {
    if (msg?.text?.body) return String(msg.text.body);
    if (msg?.interactive?.button_reply?.title) {
      return String(msg.interactive.button_reply.title);
    }
    if (msg?.interactive?.list_reply?.title) {
      return String(msg.interactive.list_reply.title);
    }
    if (msg?.interactive?.nfm_reply?.response_json) {
      try {
        return JSON.stringify(msg.interactive.nfm_reply.response_json);
      } catch {
        return "";
      }
    }
    return "";
  }

  private async resolveConversationAiMode(conversation: Conversation): Promise<"ai" | "human" | "paused"> {
    const mode = (conversation.aiMode || "ai") as "ai" | "human" | "paused";
    if (mode !== "paused" || !conversation.aiPausedUntil) {
      return mode;
    }

    if (conversation.aiPausedUntil.getTime() <= Date.now()) {
      conversation.aiMode = "ai";
      conversation.aiPausedUntil = null;
      await this.conversationRepo.save(conversation);
      return "ai";
    }

    return "paused";
  }

  private async shouldTriggerGeneralAiReply(
    tenantId: string,
    conversation: Conversation,
  ): Promise<boolean> {
    const aiEnabled = this.configService.get<string>("PLATFORM_AI_ENABLED") || "true";
    if (String(aiEnabled).toLowerCase() !== "true") {
      return false;
    }

    const mode = await this.resolveConversationAiMode(conversation);
    return mode === "ai";
  }

  private triggerGeneralAiReply(
    tenantId: string,
    from: string,
    conversation: Conversation,
    messageBody: string,
  ) {
    void this.shouldTriggerGeneralAiReply(tenantId, conversation)
      .then((shouldReply) => {
        if (!shouldReply) {
          return;
        }
        return this.aiService.process(tenantId, from, messageBody);
      })
      .catch((err) => this.logger.error("AI auto-reply failed", err));
  }

  private async dispatchWorkflowTrigger(
    account: WhatsappAccount,
    contact: Contact,
    conversation: Conversation,
    msg: any,
  ) {
    const apiBaseUrl = this.configService.get<string>("API_INTERNAL_BASE_URL") || "http://127.0.0.1:3001";
    const internalSecret =
      this.configService.get<string>("AUTOMATION_TRIGGER_SECRET") ||
      this.configService.get<string>("META_APP_SECRET");

    if (!internalSecret) {
      this.logger.warn("AUTOMATION_TRIGGER_SECRET not configured, skipping workflow trigger dispatch");
      return;
    }

    const triggerType = this.resolveTriggerType(msg);
    const context: any = {
      from: msg?.from,
      contactId: contact.id,
      conversationId: conversation.id,
      contactName: contact.name,
      messageBody: this.extractMessageBody(msg),
      messageType: msg?.type,
      messageId: msg?.id,
      whatsappMessage: msg,
    };

    // Enrich context for specialized triggers
    if (triggerType === "flow_response") {
      const flowData = msg?.interactive?.nfm_reply?.response_json;
      if (flowData) {
        try {
          context.flow = typeof flowData === "string" ? JSON.parse(flowData) : flowData;
        } catch (e) {
          context.flow = { raw: flowData };
        }
      }
    } else if (triggerType === "template_reply") {
      context.selection =
        msg?.interactive?.button_reply || msg?.interactive?.list_reply || {};
    }

    const triggerPath =
      this.configService.get<string>("AUTOMATION_TRIGGER_PATH") ||
      "/api/v1/automation/webhooks/internal/trigger";

    try {
      await axios.post(
        `${apiBaseUrl}${triggerPath}`,
        {
          tenantId: account.tenantId,
          triggerType,
          context,
        },
        {
          timeout: 5000,
          headers: {
            "x-automation-secret": internalSecret,
          },
        },
      );
    } catch (error: any) {
      const detail = error?.response?.data?.message || error?.message || "unknown_error";
      this.logger.error(`Failed dispatching workflow trigger: ${detail}`);
    }
  }

  private async handleOrderMessage(account: WhatsappAccount, msg: any) {
    const orderData = msg.order;
    if (!orderData) return;

    const from = msg.from;
    const contact = await this.contactRepo.findOneBy({ 
      tenantId: account.tenantId, 
      phoneNumber: from 
    });
    if (!contact) return;

    // 1. Create Order
    const order = this.orderRepo.create({
      tenantId: account.tenantId,
      contactId: contact.id,
      catalogId: orderData.catalog_id,
      status: "NEW",
      currency: "INR",
      totalAmount: 0,
      metadata: orderData,
      source: "whatsapp"
    } as any);

    const savedOrder = await this.orderRepo.save(order);
    const orderId = (savedOrder as any).id;
    let total = 0;

    // 2. Create Order Items
    for (const item of orderData.product_items) {
      const localProduct = await this.catalogProductRepo.findOneBy({
        tenantId: account.tenantId,
        retailerId: item.product_retailer_id
      });

      const lineTotal = (localProduct?.price || item.item_price || 0) * (item.quantity || 1);
      total += lineTotal;

      const orderItem = this.orderItemRepo.create({
        orderId: orderId,
        retailerId: item.product_retailer_id,
        name: localProduct?.name || `Product ${item.product_retailer_id}`,
        quantity: item.quantity || 1,
        unitPrice: localProduct?.price || item.item_price || 0,
        totalPrice: lineTotal
      });
      await this.orderItemRepo.save(orderItem);
    }

    // 3. Update total
    await this.orderRepo.update(orderId, { totalAmount: total });

    this.logger.log(`Order ${orderId} created for contact ${contact.id} via WhatsApp`);
    
    // 4. Emit debug/real-time event
    this.messagesGateway.emitWorkflowDebug(account.tenantId, {
      workflowId: "commerce",
      nodeId: "order_received",
      status: "completed",
      result: { orderId: orderId, total }
    });
  }

}
