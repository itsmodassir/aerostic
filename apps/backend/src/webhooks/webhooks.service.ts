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
import { WorkflowsService } from '../automation/workflows.service';

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
    private workflowsService: WorkflowsService,
    private aiService: AiService,
    private messagesGateway: MessagesGateway,
  ) { }

  verifyWebhook(mode: string, token: string, challenge: string): string {
    const verifyToken = this.configService.get('META_WEBHOOK_VERIFY_TOKEN');

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    throw new Error('Invalid verification criteria');
  }

  async processWebhook(body: any) {
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
        const profileName = value.contacts?.[0]?.profile?.name || 'Unknown';
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

      const existingMsg = await this.messageRepo.findOneBy({
        metaMessageId: messageData.id,
      });

      if (existingMsg) {
        this.logger.warn(`Duplicate message received: ${messageData.id}. Skipping.`);
        return;
      }

      const messageContent = messageData[messageData.type] || {};
      const message = this.messageRepo.create({
        tenantId: account.tenantId,
        conversationId: conversation.id,
        direction: 'in',
        type: messageData.type,
        content: messageContent,
        metaMessageId: messageData.id,
        status: 'received',
      });

      await this.messageRepo.save(message);

      this.messagesGateway.emitNewMessage(account.tenantId, {
        conversationId: conversation.id,
        contactId: contact.id,
        phone: from,
        direction: 'in',
        type: messageData.type,
        content: messageContent,
        timestamp: new Date(),
      });

      // 🔥 Trigger New Visual Automation Workflows
      await this.workflowsService.executeTrigger(account.tenantId, 'new_message', {
        from,
        messageBody: messageData.text?.body || '',
        contactId: contact.id,
      });

      // Legacy fallback
      await this.automationService.evaluate(
        account.tenantId,
        from,
        messageData.text?.body || '',
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

    return { status: 'success' };
  }
}
