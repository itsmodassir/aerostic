import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { Conversation } from '../messages/entities/conversation.entity';
import { Message } from '../messages/entities/message.entity';
import { AutomationService } from '../automation/automation.service';
import { AiService } from '../ai/ai.service';
import { MessagesGateway } from '../messages/messages.gateway';

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
    @InjectQueue('whatsapp-webhooks')
    private webhookQueue: Queue,
    private automationService: AutomationService,
    private aiService: AiService,
    private messagesGateway: MessagesGateway,
  ) {}

  verifyWebhook(mode: string, token: string, challenge: string): string {
    const verifyToken = this.configService.get('META_WEBHOOK_VERIFY_TOKEN');

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    throw new Error('Invalid verification criteria');
  }

  async processWebhook(body: any) {
    // Enqueue the raw payload for async processing
    // This ensures the Meta webhook returns 200 OK immediately
    await this.webhookQueue.add(
      'process-event',
      { body },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    return { status: 'enqueued' };
  }

  verifySignature(rawBody: string, signature: string): boolean {
    const appSecret = this.configService.get('META_APP_SECRET');
    if (!appSecret) {
      this.logger.error('META_APP_SECRET not configured');
      return false;
    }

    try {
      const [algo, hash] = signature.split('=');
      if (algo !== 'sha256') return false;

      const expectedHash = crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex');

      return hash === expectedHash;
    } catch (error) {
      this.logger.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Internal method called by the WebhooksProcessor
   * Contains the actual logic to process incoming messages
   */
  async handleProcessedPayload(body: any) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.messages) {
      const messageData = value.messages[0];
      const phoneNumberId = value.metadata?.phone_number_id;
      const from = messageData.from; // Sender phone number

      // 1. Find Tenant by phoneNumberId
      const account = await this.whatsappAccountRepo.findOneBy({
        phoneNumberId,
      });
      if (!account) {
        console.error('No tenant found for PhoneID:', phoneNumberId);
        return;
      }

      // 2. Find or Create Contact
      let contact = await this.contactRepo.findOneBy({
        tenantId: account.tenantId,
        phoneNumber: from,
      });

      if (!contact) {
        // Create new contact
        const profileName = value.contacts?.[0]?.profile?.name || 'Unknown';
        contact = this.contactRepo.create({
          tenantId: account.tenantId,
          phoneNumber: from,
          name: profileName,
        });
        await this.contactRepo.save(contact);
      }

      // 3. Find or Create Open Conversation
      let conversation = await this.conversationRepo.findOne({
        where: {
          tenantId: account.tenantId,
          contactId: contact.id,
          status: 'open',
        },
        order: { lastMessageAt: 'DESC' },
      });

      if (!conversation) {
        conversation = this.conversationRepo.create({
          tenantId: account.tenantId,
          contactId: contact.id,
          phoneNumberId: phoneNumberId,
          status: 'open',
          lastMessageAt: new Date(),
        });
        await this.conversationRepo.save(conversation);
      } else {
        conversation.lastMessageAt = new Date();
        await this.conversationRepo.save(conversation);
      }

      // 4. Save Message
      // Check for duplicate message ID (Idempotency)
      const existingMsg = await this.messageRepo.findOneBy({
        metaMessageId: messageData.id,
      });

      if (existingMsg) {
        this.logger.warn(
          `Duplicate message received: ${messageData.id}. Skipping.`,
        );
        return;
      }

      const message = this.messageRepo.create({
        tenantId: account.tenantId,
        conversationId: conversation.id,
        direction: 'in',
        type: messageData.type,
        content: messageData[messageData.type] || {},
        metaMessageId: messageData.id,
        status: 'received',
      });

      await this.messageRepo.save(message);

      // 🔥 REAL-TIME EVENT: Emit to all connected clients in this tenant's room
      this.messagesGateway.emitNewMessage(account.tenantId, {
        conversationId: conversation.id,
        contactId: contact.id,
        phone: from,
        direction: 'in',
        type: messageData.type,
        content: messageData[messageData.type] || {},
        timestamp: new Date(),
      });

      // 5. Trigger Automation
      const handled = await this.automationService.evaluate(
        account.tenantId,
        from,
        messageData.text?.body || '',
      );

      // 6. If not handled, trigger AI Agent
      if (!handled) {
        await this.aiService.process(
          account.tenantId,
          from,
          messageData.text?.body || '',
        );
      }
    }

    // Handle message status updates (delivered, read, sent, failed)
    if (value?.statuses) {
      const statusUpdate = value.statuses[0];
      const metaMessageId = statusUpdate.id;
      const newStatus = statusUpdate.status; // 'sent' | 'delivered' | 'read' | 'failed'

      this.logger.log(`Message status update: ${metaMessageId} → ${newStatus}`);

      // Find the message by Meta message ID
      const message = await this.messageRepo.findOne({
        where: { metaMessageId },
      });

      if (message) {
        // Update message status
        message.status = newStatus;
        await this.messageRepo.save(message);

        // 🔥 REAL-TIME EVENT: Emit status update to tenant room
        this.messagesGateway.emitMessageStatus(message.tenantId, {
          messageId: message.id,
          metaMessageId,
          status: newStatus,
          timestamp: new Date(),
        });

        this.logger.log(`Updated message ${message.id} status to ${newStatus}`);
      } else {
        this.logger.warn(`Message not found for Meta ID: ${metaMessageId}`);
      }
    }

    return { status: 'success' };
  }
}
