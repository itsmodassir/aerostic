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
exports.AiAgent = exports.AgentType = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("../../tenants/entities/tenant.entity");
var AgentType;
(function (AgentType) {
    AgentType["CUSTOMER_SUPPORT"] = "customer_support";
    AgentType["SALES"] = "sales";
    AgentType["LEAD_FOLLOWUP"] = "lead_followup";
    AgentType["FAQ"] = "faq";
    AgentType["CUSTOM"] = "custom";
})(AgentType || (exports.AgentType = AgentType = {}));
let AiAgent = class AiAgent {
    id;
    tenantId;
    tenant;
    name;
    description;
    type;
    systemPrompt;
    welcomeMessage;
    fallbackMessage;
    confidenceThreshold;
    maxContextMessages;
    model;
    temperature;
    maxTokens;
    isActive;
    handoffEnabled;
    handoffKeywords;
    businessHoursOnly;
    knowledgeBase;
    sampleConversations;
    totalConversations;
    successfulResolutions;
    handoffsTriggered;
    avgResponseTimeMs;
    createdAt;
    updatedAt;
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
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AiAgent.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AiAgent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AgentType,
        default: AgentType.CUSTOMER_SUPPORT,
    }),
    __metadata("design:type", String)
], AiAgent.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'system_prompt', type: 'text' }),
    __metadata("design:type", String)
], AiAgent.prototype, "systemPrompt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'welcome_message', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], AiAgent.prototype, "welcomeMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fallback_message', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], AiAgent.prototype, "fallbackMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'confidence_threshold',
        type: 'decimal',
        precision: 3,
        scale: 2,
        default: 0.7,
    }),
    __metadata("design:type", Number)
], AiAgent.prototype, "confidenceThreshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_context_messages', default: 10 }),
    __metadata("design:type", Number)
], AiAgent.prototype, "maxContextMessages", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'gemini-pro' }),
    __metadata("design:type", String)
], AiAgent.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 2, scale: 1, default: 0.7 }),
    __metadata("design:type", Number)
], AiAgent.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_tokens', default: 500 }),
    __metadata("design:type", Number)
], AiAgent.prototype, "maxTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], AiAgent.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'handoff_enabled', default: true }),
    __metadata("design:type", Boolean)
], AiAgent.prototype, "handoffEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'handoff_keywords', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], AiAgent.prototype, "handoffKeywords", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_hours_only', default: false }),
    __metadata("design:type", Boolean)
], AiAgent.prototype, "businessHoursOnly", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'knowledge_base', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AiAgent.prototype, "knowledgeBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sample_conversations', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AiAgent.prototype, "sampleConversations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_conversations', default: 0 }),
    __metadata("design:type", Number)
], AiAgent.prototype, "totalConversations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'successful_resolutions', default: 0 }),
    __metadata("design:type", Number)
], AiAgent.prototype, "successfulResolutions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'handoffs_triggered', default: 0 }),
    __metadata("design:type", Number)
], AiAgent.prototype, "handoffsTriggered", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avg_response_time_ms', default: 0 }),
    __metadata("design:type", Number)
], AiAgent.prototype, "avgResponseTimeMs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AiAgent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AiAgent.prototype, "updatedAt", void 0);
exports.AiAgent = AiAgent = __decorate([
    (0, typeorm_1.Entity)('ai_agents')
], AiAgent);
//# sourceMappingURL=ai-agent.entity.js.map