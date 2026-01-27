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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../messages/entities/message.entity");
const campaign_entity_1 = require("../campaigns/entities/campaign.entity");
const contact_entity_1 = require("../contacts/entities/contact.entity");
let AnalyticsService = class AnalyticsService {
    messageRepo;
    campaignRepo;
    contactRepo;
    constructor(messageRepo, campaignRepo, contactRepo) {
        this.messageRepo = messageRepo;
        this.campaignRepo = campaignRepo;
        this.contactRepo = contactRepo;
    }
    async getOverview(tenantId) {
        const [totalSent, totalReceived] = await Promise.all([
            this.messageRepo.count({ where: { tenantId, direction: 'out' } }),
            this.messageRepo.count({ where: { tenantId, direction: 'in' } }),
        ]);
        const totalContacts = await this.contactRepo.count({ where: { tenantId } });
        const campaigns = await this.campaignRepo.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
            take: 5
        });
        const recentMessages = await this.messageRepo.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
            take: 5,
            relations: ['conversation', 'conversation.contact']
        });
        return {
            stats: {
                totalSent,
                totalReceived,
                totalContacts,
                activeCampaigns: campaigns.filter(c => c.status === 'sending').length
            },
            recentCampaigns: campaigns,
            recentMessages: recentMessages.map(m => ({
                id: m.id,
                type: m.type,
                direction: m.direction,
                status: m.status,
                createdAt: m.createdAt,
                contactName: m.conversation?.contact?.name || 'Unknown'
            }))
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __param(2, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map