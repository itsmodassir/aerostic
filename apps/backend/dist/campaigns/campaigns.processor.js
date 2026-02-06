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
exports.CampaignProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const messages_service_1 = require("../messages/messages.service");
const typeorm_1 = require("@nestjs/typeorm");
const campaign_entity_1 = require("./entities/campaign.entity");
const typeorm_2 = require("typeorm");
let CampaignProcessor = class CampaignProcessor extends bullmq_1.WorkerHost {
    messagesService;
    campaignRepo;
    constructor(messagesService, campaignRepo) {
        super();
        this.messagesService = messagesService;
        this.campaignRepo = campaignRepo;
    }
    async process(job) {
        const { tenantId, to, type, payload, campaignId } = job.data;
        console.log(`Processing Campaign Job for ${to} (Campaign ${campaignId})`);
        try {
            await this.messagesService.send({
                tenantId,
                to,
                type,
                payload,
            });
            await this.campaignRepo.increment({ id: campaignId }, 'sentCount', 1);
        }
        catch (e) {
            console.error(`Failed to send campaign msg to ${to}`, e);
            await this.campaignRepo.increment({ id: campaignId }, 'failedCount', 1);
        }
    }
};
exports.CampaignProcessor = CampaignProcessor;
exports.CampaignProcessor = CampaignProcessor = __decorate([
    (0, bullmq_1.Processor)('campaign-queue'),
    __param(1, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        typeorm_2.Repository])
], CampaignProcessor);
//# sourceMappingURL=campaigns.processor.js.map