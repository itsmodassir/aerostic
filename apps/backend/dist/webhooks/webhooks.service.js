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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const whatsapp_account_entity_1 = require("../whatsapp/entities/whatsapp-account.entity");
const contact_entity_1 = require("../contacts/entities/contact.entity");
const conversation_entity_1 = require("../messages/entities/conversation.entity");
const message_entity_1 = require("../messages/entities/message.entity");
const automation_service_1 = require("../automation/automation.service");
const ai_service_1 = require("../ai/ai.service");
let WebhooksService = class WebhooksService {
    configService;
    whatsappAccountRepo;
    contactRepo;
    conversationRepo;
    messageRepo;
    automationService;
    aiService;
    constructor(configService, whatsappAccountRepo, contactRepo, conversationRepo, messageRepo, automationService, aiService) {
        this.configService = configService;
        this.whatsappAccountRepo = whatsappAccountRepo;
        this.contactRepo = contactRepo;
        this.conversationRepo = conversationRepo;
        this.messageRepo = messageRepo;
        this.automationService = automationService;
        this.aiService = aiService;
    }
    verifyWebhook(mode, token, challenge) {
        const verifyToken = this.configService.get('META_WEBHOOK_VERIFY_TOKEN');
        if (mode === 'subscribe' && token === verifyToken) {
            return challenge;
        }
        throw new Error('Invalid verification criteria');
    }
    async processWebhook(body) {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        if (value?.messages) {
            const messageData = value.messages[0];
            const phoneNumberId = value.metadata?.phone_number_id;
            const from = messageData.from;
            console.log('Received Message from:', from, 'via PhoneID:', phoneNumberId);
            const account = await this.whatsappAccountRepo.findOneBy({ phoneNumberId });
            if (!account) {
                console.error('No tenant found for PhoneID:', phoneNumberId);
                return;
            }
            let contact = await this.contactRepo.findOneBy({
                tenantId: account.tenantId,
                phoneNumber: from
            });
            if (!contact) {
                const profileName = value.contacts?.[0]?.profile?.name || 'Unknown';
                contact = this.contactRepo.create({
                    tenantId: account.tenantId,
                    phoneNumber: from,
                    name: profileName,
                });
                await this.contactRepo.save(contact);
                console.log('Created new contact:', profileName);
            }
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
            console.log('Message saved:', message.id);
            const handled = await this.automationService.evaluate(account.tenantId, from, messageData.text?.body || '');
            if (!handled) {
                await this.aiService.process(account.tenantId, from, messageData.text?.body || '');
            }
        }
        return { status: 'success' };
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(whatsapp_account_entity_1.WhatsappAccount)),
    __param(2, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __param(3, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(4, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        automation_service_1.AutomationService,
        ai_service_1.AiService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map