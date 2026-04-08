import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MetaService } from "./meta.service";
import { MetaController } from "./meta.controller";
import { SystemConfig } from "@shared/database/entities/core/system-config.entity";
import { WhatsappAccount } from "@shared/whatsapp/entities/whatsapp-account.entity";

import { MetaTokenService } from "./meta-token.service";
import { AuditModule } from "@api/audit/audit.module";
import { AdminModule } from "@api/admin/admin.module";

import { Template } from "@api/templates/entities/template.entity";
import { Message } from "@shared/database/entities/messaging/message.entity";
import { Conversation } from "@shared/database/entities/messaging/conversation.entity";
import { Contact } from "@shared/database/entities/core/contact.entity";
import { MetaSignatureGuard } from "./guards/meta-signature.guard";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WhatsappAccount,
      SystemConfig,
      Template,
      Message,
      Conversation,
      Contact,
    ]),
    AuditModule,
    AdminModule,
  ],
  controllers: [MetaController],
  providers: [MetaService, MetaTokenService, MetaSignatureGuard],
  exports: [MetaService],
})
export class MetaModule {}
