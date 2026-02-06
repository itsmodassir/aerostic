"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const tenants_module_1 = require("./tenants/tenants.module");
const users_module_1 = require("./users/users.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const messages_module_1 = require("./messages/messages.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const ai_module_1 = require("./ai/ai.module");
const automation_module_1 = require("./automation/automation.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const templates_module_1 = require("./templates/templates.module");
const meta_module_1 = require("./meta/meta.module");
const contacts_module_1 = require("./contacts/contacts.module");
const auth_module_1 = require("./auth/auth.module");
const analytics_module_1 = require("./analytics/analytics.module");
const admin_module_1 = require("./admin/admin.module");
const billing_module_1 = require("./billing/billing.module");
const audit_module_1 = require("./audit/audit.module");
const schedule_1 = require("@nestjs/schedule");
const common_module_1 = require("./common/common.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            common_module_1.CommonModule,
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    url: configService.get('DATABASE_URL'),
                    autoLoadEntities: true,
                    synchronize: true,
                }),
                inject: [config_1.ConfigService],
            }),
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    connection: {
                        host: config.get('REDIS_HOST') || 'localhost',
                        port: Number(config.get('REDIS_PORT')) || 6379,
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            tenants_module_1.TenantsModule,
            users_module_1.UsersModule,
            whatsapp_module_1.WhatsappModule,
            messages_module_1.MessagesModule,
            webhooks_module_1.WebhooksModule,
            ai_module_1.AiModule,
            automation_module_1.AutomationModule,
            campaigns_module_1.CampaignsModule,
            templates_module_1.TemplatesModule,
            admin_module_1.AdminModule,
            billing_module_1.BillingModule,
            meta_module_1.MetaModule,
            contacts_module_1.ContactsModule,
            auth_module_1.AuthModule,
            analytics_module_1.AnalyticsModule,
            audit_module_1.AuditModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map