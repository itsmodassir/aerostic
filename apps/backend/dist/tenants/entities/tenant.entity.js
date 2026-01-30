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
exports.Tenant = void 0;
const typeorm_1 = require("typeorm");
let Tenant = class Tenant {
    id;
    name;
    plan;
    status;
    subscriptionStatus;
    razorpayCustomerId;
    razorpaySubscriptionId;
    currentPeriodEnd;
    monthlyMessageLimit;
    messagesSentThisMonth;
    aiCredits;
    aiCreditsUsed;
    apiAccessEnabled;
    webhookUrl;
    webhookSecret;
    logo;
    website;
    phone;
    createdAt;
    updatedAt;
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'starter' }),
    __metadata("design:type", String)
], Tenant.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'active' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Tenant.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subscription_status', default: 'trial' }),
    __metadata("design:type", String)
], Tenant.prototype, "subscriptionStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'razorpay_customer_id', nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "razorpayCustomerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'razorpay_subscription_id', nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "razorpaySubscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_period_end', nullable: true }),
    __metadata("design:type", Date)
], Tenant.prototype, "currentPeriodEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monthly_message_limit', default: 1000 }),
    __metadata("design:type", Number)
], Tenant.prototype, "monthlyMessageLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'messages_sent_this_month', default: 0 }),
    __metadata("design:type", Number)
], Tenant.prototype, "messagesSentThisMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_credits', default: 100 }),
    __metadata("design:type", Number)
], Tenant.prototype, "aiCredits", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_credits_used', default: 0 }),
    __metadata("design:type", Number)
], Tenant.prototype, "aiCreditsUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'api_access_enabled', default: false }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "apiAccessEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'webhook_url', nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "webhookUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'webhook_secret', nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "webhookSecret", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Tenant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Tenant.prototype, "updatedAt", void 0);
exports.Tenant = Tenant = __decorate([
    (0, typeorm_1.Entity)('tenants')
], Tenant);
//# sourceMappingURL=tenant.entity.js.map