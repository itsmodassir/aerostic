import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MetaService } from "./meta.service";
import { MetaController } from "./meta.controller";
import { MetaToken } from "./entities/meta-token.entity";
import { SystemConfig } from "@api/admin/entities/system-config.entity";
import { WhatsappAccount } from "../whatsapp/entities/whatsapp-account.entity";

import { MetaTokenService } from "./meta-token.service";
import { AuditModule } from "@api/audit/audit.module";
import { AdminModule } from "@api/admin/admin.module";

import { Template } from "@api/templates/entities/template.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MetaToken,
      WhatsappAccount,
      SystemConfig,
      Template,
    ]),
    AuditModule,
    AdminModule,
  ],
  controllers: [MetaController],
  providers: [MetaService, MetaTokenService],
  exports: [MetaService],
})
export class MetaModule {}
