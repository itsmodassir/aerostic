import { Injectable, Logger } from "@nestjs/common";
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

    // 4. Handle SMB App State Sync (Coexistence)
    if (changes.field === "smb_app_state_sync") {
      await this.handleSMBStateSync(value);
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
        aiMode: "ai",
      });
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

    await this.messageRepo.save(message);

    // TODO: Emit to socket via Gateway (requires sharing Gateway logic or using an event emitter)
    await this.dispatchWorkflowTrigger(account, contact, conversation, msg);
  }

  private async processMessageEcho(account: WhatsappAccount, echo: any) {
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
  }

  private async handleStatusUpdates(statuses: any[]) {
    for (const statusUpdate of statuses) {
      const msg = await this.messageRepo.findOne({ where: { metaMessageId: statusUpdate.id } });
      if (msg) {
        msg.status = statusUpdate.status;
        await this.messageRepo.save(msg);
      }
    }
  }

  private async handleTemplateStatus(value: any) {
    this.logger.log(`Template status update: ${value.event}`);
    // Logic for updating template status in DB (requires Template entity)
  }

  private async handleSMBStateSync(value: any) {
    // Logic for syncing contacts from Business App
    this.logger.log("SMB App State Sync received");
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
    const context = {
      from: msg?.from,
      contactId: contact.id,
      conversationId: conversation.id,
      contactName: contact.name,
      messageBody: this.extractMessageBody(msg),
      messageType: msg?.type,
      messageId: msg?.id,
      whatsappMessage: msg,
    };

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
}
