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
exports.WhatsappAccount = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("../../tenants/entities/tenant.entity");
let WhatsappAccount = class WhatsappAccount {
    id;
    tenantId;
    tenant;
    businessId;
    wabaId;
    phoneNumberId;
    displayPhoneNumber;
    verifiedName;
    qualityRating;
    accessToken;
    tokenExpiresAt;
    mode;
    status;
    webhookVerified;
    messagingLimit;
    lastSyncedAt;
    messageCount;
    createdAt;
    updatedAt;
};
exports.WhatsappAccount = WhatsappAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WhatsappAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid', unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], WhatsappAccount.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], WhatsappAccount.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_id', nullable: true }),
    __metadata("design:type", String)
], WhatsappAccount.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'waba_id' }),
    __metadata("design:type", String)
], WhatsappAccount.prototype, "wabaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number_id', unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], WhatsappAccount.prototype, "phoneNumberId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_phone_number', nullable: true }),
    __metadata("design:type", String)
], WhatsappAccount.prototype, "displayPhoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'verified_name', nullable: true }),
    __metadata("design:type", String)
], WhatsappAccount.prototype, "verifiedName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_rating', nullable: true }),
    __metadata("design:type", String)
], WhatsappAccount.prototype, "qualityRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'access_token', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], WhatsappAccount.prototype, "accessToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token_expires_at', nullable: true }),
    __metadata("design:type", Date)
], WhatsappAccount.prototype, "tokenExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'coexistence' }),
    __metadata("design:type", String)
], WhatsappAccount.prototype, "mode", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], WhatsappAccount.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'webhook_verified', default: false }),
    __metadata("design:type", Boolean)
], WhatsappAccount.prototype, "webhookVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'messaging_limit', nullable: true }),
    __metadata("design:type", String)
], WhatsappAccount.prototype, "messagingLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_synced_at', nullable: true }),
    __metadata("design:type", Date)
], WhatsappAccount.prototype, "lastSyncedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'message_count', default: 0 }),
    __metadata("design:type", Number)
], WhatsappAccount.prototype, "messageCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WhatsappAccount.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], WhatsappAccount.prototype, "updatedAt", void 0);
exports.WhatsappAccount = WhatsappAccount = __decorate([
    (0, typeorm_1.Entity)('whatsapp_accounts')
], WhatsappAccount);
//# sourceMappingURL=whatsapp-account.entity.js.map