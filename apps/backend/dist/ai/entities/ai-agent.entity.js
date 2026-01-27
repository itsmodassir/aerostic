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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAgent = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("../../tenants/entities/tenant.entity");
let AiAgent = class AiAgent {
    id;
    tenantId;
    tenant;
    name;
    active;
    systemPrompt;
    confidenceThreshold;
};
exports.AiAgent = AiAgent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AiAgent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AiAgent.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], AiAgent.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AiAgent.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], AiAgent.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'system_prompt', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AiAgent.prototype, "systemPrompt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confidence_threshold', default: 70 }),
    __metadata("design:type", Number)
], AiAgent.prototype, "confidenceThreshold", void 0);
exports.AiAgent = AiAgent = __decorate([
    (0, typeorm_1.Entity)('ai_agents')
], AiAgent);
//# sourceMappingURL=ai-agent.entity.js.map