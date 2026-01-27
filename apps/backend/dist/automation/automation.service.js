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
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const automation_rule_entity_1 = require("./entities/automation-rule.entity");
const messages_service_1 = require("../messages/messages.service");
let AutomationService = class AutomationService {
    ruleRepo;
    messagesService;
    constructor(ruleRepo, messagesService) {
        this.ruleRepo = ruleRepo;
        this.messagesService = messagesService;
    }
    async createRule(tenantId, ruleData) {
        const rule = this.ruleRepo.create({ ...ruleData, tenantId });
        return this.ruleRepo.save(rule);
    }
    async getRules(tenantId) {
        return this.ruleRepo.find({ where: { tenantId } });
    }
    async evaluate(tenantId, from, messageBody) {
        const rules = await this.ruleRepo.find({ where: { tenantId, isActive: true } });
        for (const rule of rules) {
            let match = false;
            const lowerMsg = messageBody.toLowerCase();
            const lowerKey = rule.keyword.toLowerCase();
            if (rule.trigger === 'keyword') {
                if (rule.condition === 'contains' && lowerMsg.includes(lowerKey))
                    match = true;
                if (rule.condition === 'exact' && lowerMsg === lowerKey)
                    match = true;
            }
            if (match) {
                console.log(`Executing Rule: ${rule.name}`);
                await this.executeAction(tenantId, from, rule);
                return true;
            }
        }
        return false;
    }
    async executeAction(tenantId, to, rule) {
        if (rule.action === 'reply') {
            await this.messagesService.send({
                tenantId,
                to,
                type: 'text',
                payload: { text: rule.payload.text }
            });
        }
    }
};
exports.AutomationService = AutomationService;
exports.AutomationService = AutomationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(automation_rule_entity_1.AutomationRule)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        messages_service_1.MessagesService])
], AutomationService);
//# sourceMappingURL=automation.service.js.map