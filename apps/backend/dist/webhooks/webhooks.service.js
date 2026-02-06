"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const whatsapp_account_entity_1 = require("../whatsapp/entities/whatsapp-account.entity");
const contact_entity_1 = require("../contacts/entities/contact.entity");
const conversation_entity_1 = require("../messages/entities/conversation.entity");
const message_entity_1 = require("../messages/entities/message.entity");
const automation_service_1 = require("../automation/automation.service");
const ai_service_1 = require("../ai/ai.service");
const messages_gateway_1 = require("../messages/messages.gateway");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    configService;
    whatsappAccountRepo;
    contactRepo;
    conversationRepo;
    messageRepo;
    webhookQueue;
    automationService;
    aiService;
    messagesGateway;
    logger = new common_1.Logger(WebhooksService_1.name);
    constructor(configService, whatsappAccountRepo, contactRepo, conversationRepo, messageRepo, webhookQueue, automationService, aiService, messagesGateway) {
        this.configService = configService;
        this.whatsappAccountRepo = whatsappAccountRepo;
        this.contactRepo = contactRepo;
        this.conversationRepo = conversationRepo;
        this.messageRepo = messageRepo;
        this.webhookQueue = webhookQueue;
        this.automationService = automationService;
        this.aiService = aiService;
        this.messagesGateway = messagesGateway;
    }
    verifyWebhook(mode, token, challenge) {
        const verifyToken = this.configService.get('META_WEBHOOK_VERIFY_TOKEN');
        if (mode === 'subscribe' && token === verifyToken) {
            return challenge;
        }
        throw new Error('Invalid verification criteria');
    }
    async processWebhook(body) {
        await this.webhookQueue.add('process-event', { body }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
        });
        return { status: 'enqueued' };
    }
    async handleProcessedPayload(body) {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        if (value?.messages) {
            const messageData = value.messages[0];
            const phoneNumberId = value.metadata?.phone_number_id;
            const from = messageData.from;
            console.log('Asynchronously processing Message from:', from);
            const account = await this.whatsappAccountRepo.findOneBy({
                phoneNumberId,
            });
            if (!account) {
                console.error('No tenant found for PhoneID:', phoneNumberId);
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
            }
            else {
                conversation.lastMessageAt = new Date();
                await this.conversationRepo.save(conversation);
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
            this.messagesGateway.emitNewMessage(account.tenantId, {
                conversationId: conversation.id,
                contactId: contact.id,
                phone: from,
                direction: 'in',
                type: messageData.type,
                content: messageData[messageData.type] || {},
                timestamp: new Date(),
            });
            const handled = await this.automationService.evaluate(account.tenantId, from, messageData.text?.body || '');
            if (!handled) {
                await this.aiService.process(account.tenantId, from, messageData.text?.body || '');
            }
        }
        if (value?.statuses) {
            const statusUpdate = value.statuses[0];
            const metaMessageId = statusUpdate.id;
            const newStatus = statusUpdate.status;
            this.logger.log(`Message status update: ${metaMessageId} → ${newStatus}`);
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
                this.logger.log(`Updated message ${message.id} status to ${newStatus}`);
            }
            else {
                this.logger.warn(`Message not found for Meta ID: ${metaMessageId}`);
            }
        }
        return { status: 'success' };
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(whatsapp_account_entity_1.WhatsappAccount)),
    __param(2, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __param(3, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(4, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(5, (0, bullmq_1.InjectQueue)('whatsapp-webhooks')),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        bullmq_2.Queue,
        automation_service_1.AutomationService,
        ai_service_1.AiService,
        messages_gateway_1.MessagesGateway])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map