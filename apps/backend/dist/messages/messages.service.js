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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const whatsapp_account_entity_1 = require("../whatsapp/entities/whatsapp-account.entity");
const message_entity_1 = require("./entities/message.entity");
const contact_entity_1 = require("../contacts/entities/contact.entity");
const conversation_entity_1 = require("./entities/conversation.entity");
const meta_token_entity_1 = require("../meta/entities/meta-token.entity");
const axios_1 = __importDefault(require("axios"));
const messages_gateway_1 = require("./messages.gateway");
let MessagesService = class MessagesService {
    whatsappAccountRepo;
    messageRepo;
    metaTokenRepo;
    contactRepo;
    conversationRepo;
    messagesGateway;
    constructor(whatsappAccountRepo, messageRepo, metaTokenRepo, contactRepo, conversationRepo, messagesGateway) {
        this.whatsappAccountRepo = whatsappAccountRepo;
        this.messageRepo = messageRepo;
        this.metaTokenRepo = metaTokenRepo;
        this.contactRepo = contactRepo;
        this.conversationRepo = conversationRepo;
        this.messagesGateway = messagesGateway;
    }
    async send(dto) {
        const account = await this.whatsappAccountRepo.findOneBy({
            tenantId: dto.tenantId,
        });
        if (!account) {
            throw new common_1.NotFoundException('WhatsApp account not found for this tenant');
        }
        let contact = await this.contactRepo.findOneBy({
            tenantId: dto.tenantId,
            phoneNumber: dto.to,
        });
        if (!contact) {
            contact = this.contactRepo.create({
                tenantId: dto.tenantId,
                phoneNumber: dto.to,
                name: dto.to,
            });
            await this.contactRepo.save(contact);
        }
        let conversation = await this.conversationRepo.findOne({
            where: { tenantId: dto.tenantId, contactId: contact.id, status: 'open' },
        });
        if (!conversation) {
            conversation = this.conversationRepo.create({
                tenantId: dto.tenantId,
                contactId: contact.id,
                phoneNumberId: account.phoneNumberId,
                status: 'open',
                lastMessageAt: new Date(),
            });
            await this.conversationRepo.save(conversation);
        }
        else {
            conversation.lastMessageAt = new Date();
            await this.conversationRepo.save(conversation);
        }
        const tokenRecord = await this.metaTokenRepo.findOne({
            where: { tokenType: 'system' },
            order: { createdAt: 'DESC' },
        });
        if (!tokenRecord) {
            throw new common_1.InternalServerErrorException('System token configuration missing');
        }
        const token = tokenRecord.encryptedToken;
        const url = `https://graph.facebook.com/v18.0/${account.phoneNumberId}/messages`;
        const body = {
            messaging_product: 'whatsapp',
            to: dto.to,
            type: dto.type,
        };
        if (dto.type === 'text') {
            body.text = { body: dto.payload.text };
        }
        else if (dto.type === 'template') {
            body.template = dto.payload;
        }
        try {
            const response = await axios_1.default.post(url, body, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const metaId = response.data.messages?.[0]?.id;
            const message = this.messageRepo.create({
                tenantId: dto.tenantId,
                conversationId: conversation.id,
                direction: 'out',
                type: dto.type,
                content: dto.type === 'text' ? { body: dto.payload.text } : dto.payload,
                metaMessageId: metaId,
                status: 'sent',
            });
            await this.messageRepo.save(message);
            this.messagesGateway.emitNewMessage(dto.tenantId || '', {
                conversationId: conversation.id,
                contactId: contact.id,
                phone: dto.to,
                direction: 'out',
                type: dto.type,
                content: dto.type === 'text' ? { body: dto.payload.text } : dto.payload,
                timestamp: new Date(),
            });
            return { sent: true, metaId, messageId: message.id };
        }
        catch (error) {
            console.error('Meta API Error:', error.response?.data || error.message);
            throw new common_1.InternalServerErrorException('Failed to send WhatsApp message');
        }
    }
    async getConversations(tenantId) {
        return this.conversationRepo.find({
            where: { tenantId, status: 'open' },
            relations: ['contact'],
            order: { lastMessageAt: 'DESC' },
        });
    }
    async getMessages(tenantId, conversationId) {
        return this.messageRepo.find({
            where: { tenantId, conversationId },
            order: { createdAt: 'ASC' },
        });
    }
    async cleanupMockData() {
        const mockNames = [
            'Vikram Singh',
            'Neha Gupta',
            'Ravi Mehta',
            'Anjali Sharma',
        ];
        const contacts = await this.contactRepo
            .createQueryBuilder('contact')
            .where('contact.name IN (:...names)', { names: mockNames })
            .getMany();
        if (contacts.length === 0)
            return { deleted: 0 };
        const contactIds = contacts.map((c) => c.id);
        await this.conversationRepo
            .createQueryBuilder()
            .delete()
            .from(conversation_entity_1.Conversation)
            .where('contactId IN (:...ids)', { ids: contactIds })
            .execute();
        const result = await this.contactRepo
            .createQueryBuilder()
            .delete()
            .from(contact_entity_1.Contact)
            .where('id IN (:...ids)', { ids: contactIds })
            .execute();
        return { deleted: result.affected || 0 };
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(whatsapp_account_entity_1.WhatsappAccount)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(2, (0, typeorm_1.InjectRepository)(meta_token_entity_1.MetaToken)),
    __param(3, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __param(4, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        messages_gateway_1.MessagesGateway])
], MessagesService);
//# sourceMappingURL=messages.service.js.map