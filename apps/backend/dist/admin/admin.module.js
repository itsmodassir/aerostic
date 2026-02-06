"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const whatsapp_account_entity_1 = require("../whatsapp/entities/whatsapp-account.entity");
const system_config_entity_1 = require("./entities/system-config.entity");
const message_entity_1 = require("../messages/entities/message.entity");
const api_key_entity_1 = require("../billing/entities/api-key.entity");
const subscription_entity_1 = require("../billing/entities/subscription.entity");
const audit_module_1 = require("../audit/audit.module");
const webhook_endpoint_entity_1 = require("../billing/entities/webhook-endpoint.entity");
const conversation_entity_1 = require("../messages/entities/conversation.entity");
const contact_entity_1 = require("../contacts/entities/contact.entity");
const billing_module_1 = require("../billing/billing.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                tenant_entity_1.Tenant,
                whatsapp_account_entity_1.WhatsappAccount,
                system_config_entity_1.SystemConfig,
                message_entity_1.Message,
                api_key_entity_1.ApiKey,
                subscription_entity_1.Subscription,
                webhook_endpoint_entity_1.WebhookEndpoint,
                conversation_entity_1.Conversation,
                contact_entity_1.Contact,
            ]),
            audit_module_1.AuditModule,
            billing_module_1.BillingModule,
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService],
        exports: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map