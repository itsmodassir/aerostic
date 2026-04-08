import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Logger,
  HttpException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WhatsappAccount } from "@shared/whatsapp/entities/whatsapp-account.entity";
import { Message } from "@shared/database/entities/messaging/message.entity";
import { Contact } from "@shared/database/entities/core/contact.entity";
import { Conversation } from "@shared/database/entities/messaging/conversation.entity";
import { Template } from "../templates/entities/template.entity";
import { SendMessageDto } from "./dto/send-message.dto";
import axios from "axios";
import { MessagesGateway } from "./messages.gateway";
import { AuditService, LogLevel, LogCategory } from "../audit/audit.service";
import { EncryptionService } from "@shared/encryption.service";
import { BillingService } from "../billing/billing.service";
import { AdminConfigService } from "../admin/services/admin-config.service";
import { WalletService } from "../billing/wallet.service";
import { WalletAccountType } from "@shared/database/entities/billing/wallet-account.entity";
import { TransactionType } from "@shared/database/entities/billing/wallet-transaction.entity";


@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(WhatsappAccount)
    private whatsappAccountRepo: Repository<WhatsappAccount>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(Template)
    private templateRepo: Repository<Template>,
    private messagesGateway: MessagesGateway,
    private auditService: AuditService,
    private encryptionService: EncryptionService,
    private billingService: BillingService,
    private adminConfigService: AdminConfigService,
    private walletService: WalletService,
  ) { }

  private readonly accountCache = new Map<string, { account: WhatsappAccount; timestamp: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  private extractMessagePreview(message: Message | null | undefined): string {
    if (!message) return "";
    return (
      message.body ||
      message.content?.body ||
      message.content?.text?.body ||
      message.content?.interactive?.button_reply?.title ||
      message.content?.interactive?.list_reply?.title ||
      `[${message.type}]`
    );
  }

  async send(dto: SendMessageDto) {
    // 1. Resolve Tenant's WhatsApp Account (with caching)
    const now = Date.now();
    const cached = this.accountCache.get(dto.tenantId || "");
    let account: WhatsappAccount | null = null;

    if (cached && (now - cached.timestamp < this.CACHE_TTL)) {
      account = cached.account;
    } else {
      account = await this.whatsappAccountRepo.findOneBy({
        tenantId: dto.tenantId,
      });
      if (account) {
        this.accountCache.set(dto.tenantId || "", { account, timestamp: now });
      }
    }

    if (!account) {
      throw new NotFoundException("WhatsApp account not found for this tenant");
    }

    // 2. Resolve Contact & Conversation (Prerequisite for storage)
    let contact = await this.contactRepo.findOneBy({
      tenantId: dto.tenantId,
      phoneNumber: dto.to,
    });
    if (!contact) {
      contact = this.contactRepo.create({
        tenantId: dto.tenantId,
        phoneNumber: dto.to,
        name: dto.to, // Default name
      });
      await this.contactRepo.save(contact);
    }

    let conversation = await this.conversationRepo.findOne({
      where: { tenantId: dto.tenantId, contactId: contact.id, status: "open" },
    });

    if (!conversation) {
      conversation = this.conversationRepo.create({
        tenantId: dto.tenantId,
        contactId: contact.id,
        phoneNumberId: account.phoneNumberId,
        status: "open",
        lastMessageAt: new Date(),
      });
      await this.conversationRepo.save(conversation);
    } else {
      conversation.lastMessageAt = new Date();

      // ─── Human Handover Auto-Pause ─────────────────────────────────────
      if (dto.agentId) {
        conversation.unreadCount = 0; // Reset unread when agent replies
        
        if (conversation.aiMode !== 'human') {
          const pauseMinsStr = await this.adminConfigService.getConfigValue('platform.ai_pause_minutes');
          const pauseMins = parseInt(pauseMinsStr || '30', 10);
          const pauseUntil = new Date(Date.now() + pauseMins * 60 * 1000);
          conversation.aiMode = 'paused';
          conversation.aiPausedUntil = pauseUntil;
          this.logger.log(`Human agent ${dto.agentId} replied — AI paused for ${pauseMins}m on conv ${conversation.id}`);
        }
      }

      await this.conversationRepo.save(conversation);
    }

    // 3. Get Tenant's Access Token
    if (!account.accessToken) {
      throw new InternalServerErrorException(
        "WhatsApp access token missing for this account.",
      );
    }

    const token = this.encryptionService.decrypt(account.accessToken);

    // 4. Construct Meta Graph API Payload
    const apiVersion =
      (await this.adminConfigService.getConfigValue("meta.api_version")) ||
      "v25.0";
    const url = `https://graph.facebook.com/${apiVersion}/${account.phoneNumberId}/messages`;

    const body: any = {
      messaging_product: "whatsapp",
      to: dto.to,
      type: dto.type,
    };

    if (dto.type === "text") {
      body.text = { body: dto.payload.text };
    } else if (dto.type === "template") {
      body.template = dto.payload;
    } else if (dto.type === "interactive") {
      body.interactive = dto.payload;
    } else if (dto.type === "image") {
      body.image = dto.payload;
    } else if (dto.type === "video") {
      body.video = dto.payload;
    } else if (dto.type === "document") {
      body.document = dto.payload;
    }

    // 5. Pre-send Wallet Deduction (Only for Templates and not skipped)
    let transactionRecord = null;
    let templateRate = 0;
    if (dto.type === "template" && dto.tenantId && !dto.skipBilling) {
      try {
        // 1. Resolve Template Category
        const templateName = dto.payload.name;
        const template = await this.templateRepo.findOne({
          where: { tenantId: dto.tenantId, name: templateName }
        });

        const category = template?.category?.toLowerCase() || "marketing"; // Fallback to marketing

        // 2. Map Category to Rate Key
        let rateKey = "whatsapp.template_rate_inr";
        if (category === "marketing") {
          rateKey = "whatsapp.marketing_rate_custom";
        } else if (category === "utility") {
          rateKey = "whatsapp.utility_rate_custom";
        } else if (category === "authentication") {
          rateKey = "whatsapp.auth_rate_custom";
        }

        const rateStr = await this.adminConfigService.getConfigValue(
          rateKey,
          dto.tenantId
        );
        templateRate = parseFloat(rateStr || "0.80");

        transactionRecord = await this.walletService.processTransaction(
          dto.tenantId,
          WalletAccountType.MAIN_BALANCE,
          templateRate,
          TransactionType.DEBIT,
          {
            referenceType: "TEMPLATE_MESSAGE_SEND",
            referenceId: `msg_${Date.now()}`,
            description: `Template (${category}) sent to ${dto.to}`,
          }
        );
      } catch (error) {
        if (error instanceof HttpException) {
          const message = error.message || "Unable to prepare template message";
          throw new BadRequestException(
            message === "Insufficient balance"
              ? "Insufficient wallet balance for template message"
              : message,
          );
        }

        this.logger.error(
          `Template billing preparation failed for tenant ${dto.tenantId}`,
          error instanceof Error ? error.stack : String(error),
        );
        throw new BadRequestException("Unable to prepare template message");
      }
    }

    // 6. Send Request
    try {
      const response = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-tenant-id": dto.tenantId,
        },
        timeout: 10000, // 10s timeout for Meta API
      });

      const metaId = response.data.messages?.[0]?.id;

      // 7. Save Outbound Message to DB
      const message = this.messageRepo.create({
        tenantId: dto.tenantId,
        conversationId: conversation.id,
        direction: "out",
        type: dto.type,
        content: dto.type === "text" ? { body: dto.payload.text } : dto.payload,
        metaMessageId: metaId,
        status: "sent",
        campaignId: dto.campaignId,
        // Associate transaction info to metadata if needed
        metadata: transactionRecord ? { transactionId: transactionRecord.id, cost: templateRate } : {},
      });
      await this.messageRepo.save(message);

      try {
        this.messagesGateway.emitNewMessage(dto.tenantId || "", {
          id: message.id,
          metaId,
          conversationId: conversation.id,
          contactId: contact.id,
          phone: dto.to,
          direction: "out",
          type: dto.type,
          content: dto.type === "text" ? { body: dto.payload.text } : dto.payload,
          timestamp: message.createdAt || new Date(),
          status: message.status,
          agentId: dto.agentId,
        });
      } catch (gatewayError: any) {
        this.logger.warn(`Failed to emit real-time outbound message event: ${gatewayError?.message || gatewayError}`);
      }

      const postSendTasks: Promise<unknown>[] = [];
      if (dto.tenantId) {
        postSendTasks.push(
          this.billingService.incrementUsage(dto.tenantId, "messages_sent", 1),
        );
      }

      postSendTasks.push(
        this.auditService.logAction(
          "SYSTEM",
          "Message Service",
          "SEND_WHATSAPP_MESSAGE",
          `Destination: ${dto.to}`,
          dto.tenantId,
          {
            messageId: message.id,
            metaId,
            type: dto.type,
            conversationId: conversation.id,
          },
          undefined,
          LogLevel.SUCCESS,
          LogCategory.WHATSAPP,
          "MessagesService",
        ),
      );

      const postSendResults = await Promise.allSettled(postSendTasks);
      postSendResults.forEach((result, index) => {
        if (result.status === "rejected") {
          const label = index === 0 && dto.tenantId ? "usage tracking" : "audit log";
          this.logger.warn(`WhatsApp message sent but ${label} failed: ${result.reason?.message || result.reason}`);
        }
      });

      return { sent: true, metaId, messageId: message.id };
    } catch (error) {
      // Rollback deduction if Meta API fails
      if (transactionRecord && dto.tenantId) {
        try {
          await this.walletService.processTransaction(
            dto.tenantId,
            WalletAccountType.MAIN_BALANCE,
            templateRate,
            TransactionType.CREDIT,
            {
              referenceType: "TEMPLATE_MESSAGE_REFUND",
              referenceId: transactionRecord.id, // Link to original debit
              description: `Refund for failed template message to ${dto.to}`,
            }
          );
        } catch (rollbackError) {
          console.error("Critical: Failed to rollback template charge", rollbackError);
        }
      }
      const metaMessage =
        error?.response?.data?.error?.error_user_msg ||
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send WhatsApp message";
      this.logger.error(`Meta API Error: ${JSON.stringify(error?.response?.data || metaMessage)}`);
      throw new InternalServerErrorException(metaMessage);
    }
  }

  async getConversations(tenantId: string) {
    const conversations = await this.conversationRepo.find({
      where: { tenantId },
      relations: ["contact", "assignedAgent"],
      order: { lastMessageAt: "DESC" },
    });

    const latestMessages = await this.messageRepo
      .createQueryBuilder("message")
      .distinctOn(["message.conversationId"])
      .where("message.tenantId = :tenantId", { tenantId })
      .orderBy("message.conversationId", "ASC")
      .addOrderBy("message.createdAt", "DESC")
      .getMany();

    const latestMessageByConversation = new Map(
      latestMessages
        .filter((message) => !!message.conversationId)
        .map((message) => [message.conversationId, message]),
    );

    return conversations.map((conversation) => {
      const latestMessage = latestMessageByConversation.get(conversation.id);
      return {
        ...conversation,
        contact: {
          ...conversation.contact,
          name:
            conversation.contact?.name ||
            conversation.contactName ||
            conversation.phoneNumber ||
            "Unknown Contact",
          phoneNumber:
            conversation.contact?.phoneNumber || conversation.phoneNumber || "",
        },
        assignedTo: conversation.assignedAgent
          ? {
              id: conversation.assignedAgent.id,
              name: conversation.assignedAgent.name,
              email: conversation.assignedAgent.email,
              avatar: conversation.assignedAgent.avatar,
              role: conversation.assignedAgent.role === "super_admin" ? "admin" : "agent",
              status: "online",
            }
          : undefined,
        channel: "whatsapp",
        priority: "medium",
        isBot: conversation.aiMode === "ai",
        lastMessage: this.extractMessagePreview(latestMessage),
      };
    });
  }

  async getRecentMessages(tenantId: string, limit: number = 5) {
    const messages = await this.messageRepo.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
      take: limit,
      relations: ["conversation", "conversation.contact"],
    });
    return messages.map((m) => ({
      id: m.id,
      type: m.type,
      direction: m.direction,
      status: m.status,
      createdAt: m.createdAt,
      contactName: m.conversation?.contact?.name || "Unknown",
      content: m.content,
    }));
  }

  async getMessages(tenantId: string, conversationId: string) {
    const messages = await this.messageRepo.find({
      where: { tenantId, conversationId },
      order: { createdAt: "ASC" },
    });

    return messages.map((message) => ({
      ...message,
      content:
        message.content ||
        (message.body ? { body: message.body } : null),
    }));
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversationRepo.findOneBy({ id: conversationId });
  }

  async setConversationStatus(
    conversationId: string,
    status: string,
  ): Promise<void> {
    await this.conversationRepo.update({ id: conversationId }, { status });
  }

  async cleanupMockData() {
    const mockNames = [
      "Vikram Singh",
      "Neha Gupta",
      "Ravi Mehta",
      "Anjali Sharma",
    ];

    // Delete contacts (cascading should handle conversations/messages usually, but we'll check)
    // If cascade isn't set up, we might need to delete conversations first.
    // Assuming cascade or manual cleanup:

    const contacts = await this.contactRepo
      .createQueryBuilder("contact")
      .where("contact.name IN (:...names)", { names: mockNames })
      .getMany();

    if (contacts.length === 0) return { deleted: 0 };

    const contactIds = contacts.map((c) => c.id);

    // Delete conversations for these contacts
    await this.conversationRepo
      .createQueryBuilder()
      .delete()
      .from(Conversation)
      .where("contactId IN (:...ids)", { ids: contactIds })
      .execute();

    // Delete contacts
    const result = await this.contactRepo
      .createQueryBuilder()
      .delete()
      .from(Contact)
      .where("id IN (:...ids)", { ids: contactIds })
      .execute();

    return { deleted: result.affected || 0 };
  }

  // ─── AI Handover Mode Methods ─────────────────────────────────────────────

  /**
   * Set the AI mode for a conversation.
   * mode: 'ai' = AI active, 'human' = human took over, 'paused' = AI paused temporarily
   * pauseMinutes: only used when mode = 'paused'
   */
  async setAiMode(
    conversationId: string,
    tenantId: string,
    mode: 'ai' | 'human' | 'paused',
    pauseMinutes?: number,
  ) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId, tenantId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    conversation.aiMode = mode;
    if (mode === 'paused' && pauseMinutes) {
      conversation.aiPausedUntil = new Date(Date.now() + pauseMinutes * 60 * 1000);
    } else if (mode === 'ai' || mode === 'human') {
      conversation.aiPausedUntil = null;
    }
    await this.conversationRepo.save(conversation);
    return { conversationId, aiMode: conversation.aiMode, aiPausedUntil: conversation.aiPausedUntil };
  }

  /**
   * Get AI status + 24h window info for a conversation (for frontend timers)
   */
  async getConversationStatus(conversationId: string, tenantId: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId, tenantId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const now = new Date();
    const pauseMinsStr = await this.adminConfigService.getConfigValue('platform.ai_pause_minutes');
    const pauseMins = parseInt(pauseMinsStr || '30', 10);

    // Compute 24h window
    let windowExpiresAt: Date | null = null;
    let windowExpired = false;
    const baseInbound = conversation.lastInboundAt || conversation.firstInboundAt;
    if (baseInbound) {
      windowExpiresAt = new Date(baseInbound.getTime() + 24 * 60 * 60 * 1000);
      windowExpired = windowExpiresAt <= now;
    }

    // Compute AI pause
    let aiMode = conversation.aiMode || 'ai';
    let pauseSecondsLeft = 0;
    if (aiMode === 'paused' && conversation.aiPausedUntil) {
      const diff = conversation.aiPausedUntil.getTime() - now.getTime();
      if (diff <= 0) {
        // Pause has expired — auto-resume
        aiMode = 'ai';
        conversation.aiMode = 'ai';
        conversation.aiPausedUntil = null;
        await this.conversationRepo.save(conversation);
      } else {
        pauseSecondsLeft = Math.floor(diff / 1000);
      }
    }

    return {
      conversationId,
      aiMode,
      aiPausedUntil: conversation.aiPausedUntil,
      pauseSecondsLeft,
      firstInboundAt: conversation.firstInboundAt,
      windowExpiresAt,
      windowExpired,
      windowSecondsLeft: windowExpiresAt ? Math.max(0, Math.floor((windowExpiresAt.getTime() - now.getTime()) / 1000)) : null,
      defaultPauseMinutes: pauseMins,
    };
  }
}
