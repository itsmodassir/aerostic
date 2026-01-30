"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const usage_metric_entity_1 = require("./entities/usage-metric.entity");
const subscription_entity_1 = require("./entities/subscription.entity");
const api_key_entity_1 = require("./entities/api-key.entity");
const webhook_endpoint_entity_1 = require("./entities/webhook-endpoint.entity");
const razorpay_service_1 = require("./razorpay.service");
const billing_service_1 = require("./billing.service");
const billing_controller_1 = require("./billing.controller");
let BillingModule = class BillingModule {
};
exports.BillingModule = BillingModule;
exports.BillingModule = BillingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                usage_metric_entity_1.UsageMetric,
                subscription_entity_1.Subscription,
                api_key_entity_1.ApiKey,
                webhook_endpoint_entity_1.WebhookEndpoint,
            ]),
        ],
        controllers: [billing_controller_1.BillingController],
        providers: [razorpay_service_1.RazorpayService, billing_service_1.BillingService],
        exports: [razorpay_service_1.RazorpayService, billing_service_1.BillingService],
    })
], BillingModule);
//# sourceMappingURL=billing.module.js.map