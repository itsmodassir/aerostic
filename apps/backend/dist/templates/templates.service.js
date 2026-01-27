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
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const template_entity_1 = require("./entities/template.entity");
const meta_service_1 = require("../meta/meta.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let TemplatesService = class TemplatesService {
    templateRepo;
    metaService;
    whatsappService;
    constructor(templateRepo, metaService, whatsappService) {
        this.templateRepo = templateRepo;
        this.metaService = metaService;
        this.whatsappService = whatsappService;
    }
    async findAll(tenantId) {
        return this.templateRepo.find({ where: { tenantId } });
    }
    async sync(tenantId) {
        const creds = await this.whatsappService.getCredentials(tenantId);
        if (!creds || !creds.wabaId || !creds.accessToken) {
            throw new Error('WhatsApp not connected');
        }
        const metaTemplates = await this.metaService.getTemplates(creds.wabaId, creds.accessToken);
        const entities = metaTemplates.map((t) => ({
            tenantId,
            name: t.name,
            language: t.language,
            status: t.status,
            category: t.category,
            components: t.components
        }));
        await this.templateRepo.delete({ tenantId });
        return this.templateRepo.save(entities);
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(template_entity_1.Template)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        meta_service_1.MetaService,
        whatsapp_service_1.WhatsappService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map