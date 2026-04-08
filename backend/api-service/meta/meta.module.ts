import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MetaService } from "./meta.service";
import { MetaController } from "./meta.controller";
import { SystemConfig } from "@shared/database/entities/core/system-config.entity";
import { WhatsappAccount } from "@shared/whatsapp/entities/whatsapp-account.entity";

import { MetaTokenService } from "./meta-token.service";
import { AuditModule } from "../audit/audit.module";
import { AdminModule } from "../admin/admin.module";
import { WebhooksModule } from "../webhooks/webhooks.module";
import { WhatsappModule } from "@shared/whatsapp/whatsapp.module";

import { Template } from "../templates/entities/template.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WhatsappAccount,
      SystemConfig,
      Template,
    ]),
    AuditModule,
    AdminModule,
    WebhooksModule,
    WhatsappModule,
  ],
  controllers: [MetaController],
  providers: [MetaService, MetaTokenService],
  exports: [MetaService],
})
export class MetaModule {}
