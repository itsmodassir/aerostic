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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_agent_entity_1 = require("./entities/ai-agent.entity");
let AiController = class AiController {
    aiAgentRepo;
    constructor(aiAgentRepo) {
        this.aiAgentRepo = aiAgentRepo;
    }
    async getAgent(tenantId) {
        let agent = await this.aiAgentRepo.findOneBy({ tenantId });
        if (!agent) {
            return {
                systemPrompt: "You are a helpful and friendly customer support agent for Aerostic, a SaaS platform. Answer concisely.",
                active: true
            };
        }
        return agent;
    }
    async saveAgent(body) {
        let agent = await this.aiAgentRepo.findOneBy({ tenantId: body.tenantId });
        if (!agent) {
            agent = this.aiAgentRepo.create({ tenantId: body.tenantId });
        }
        agent.systemPrompt = body.systemPrompt;
        agent.active = body.active;
        return this.aiAgentRepo.save(agent);
    }
    async respond(body) {
        console.log('AI Respond triggered internally', body);
        return { status: 'processed' };
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Get)('agent'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getAgent", null);
__decorate([
    (0, common_1.Post)('agent'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "saveAgent", null);
__decorate([
    (0, common_1.Post)('respond'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "respond", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __param(0, (0, typeorm_1.InjectRepository)(ai_agent_entity_1.AiAgent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AiController);
//# sourceMappingURL=ai.controller.js.map