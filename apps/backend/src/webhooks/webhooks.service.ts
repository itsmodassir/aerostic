import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { Conversation } from '../messages/entities/conversation.entity';
import { Message } from '../messages/entities/message.entity';
import { AutomationService } from '../automation/automation.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class WebhooksService {
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
        private automationService: AutomationService,
        private aiService: AiService,
    ) { }

    verifyWebhook(mode: string, token: string, challenge: string): string {
        const verifyToken = this.configService.get('META_WEBHOOK_VERIFY_TOKEN');
        if (mode === 'subscribe' && token === verifyToken) {
            return challenge;
        }
        throw new Error('Invalid verification criteria');
    }

    async processWebhook(body: any) {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (value?.messages) {
            const messageData = value.messages[0];
            const phoneNumberId = value.metadata?.phone_number_id;
            const from = messageData.from; // Sender phone number

            console.log('Received Message from:', from, 'via PhoneID:', phoneNumberId);

            // 1. Find Tenant by phoneNumberId
            const account = await this.whatsappAccountRepo.findOneBy({ phoneNumberId });
            if (!account) {
                console.error('No tenant found for PhoneID:', phoneNumberId);
                return;
            }

            // 2. Find or Create Contact
            let contact = await this.contactRepo.findOneBy({
                tenantId: account.tenantId,
                phoneNumber: from
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
                console.log('Created new contact:', profileName);
            }

            // 3. Find or Create Open Conversation
            let conversation = await this.conversationRepo.findOne({
                where: {
                    tenantId: account.tenantId,
                    contactId: contact.id,
                    status: 'open'
                },
                order: { lastMessageAt: 'DESC' }
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
                // Update timestamp
                conversation.lastMessageAt = new Date();
                await this.conversationRepo.save(conversation);
            }

            // 4. Save Message
            const message = this.messageRepo.create({
                tenantId: account.tenantId,
                conversationId: conversation.id,
                direction: 'in',
                type: messageData.type,
                content: messageData[messageData.type] || {}, // Store text body or image info
                metaMessageId: messageData.id,
                status: 'received',
            });

            await this.messageRepo.save(message);
            console.log('Message saved:', message.id);

            // 5. Trigger Automation
            const handled = await this.automationService.evaluate(account.tenantId, from, messageData.text?.body || '');

            // 6. If not handled, trigger AI Agent
            if (!handled) {
                await this.aiService.process(account.tenantId, from, messageData.text?.body || '');
            }
        }
        return { status: 'success' };
    }
}
