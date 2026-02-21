import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WhatsappService } from "./whatsapp.service";
import { WhatsappController } from "./whatsapp.controller";
import { SystemConfig } from "@api/admin/entities/system-config.entity";
import { WhatsappAccount } from "./entities/whatsapp-account.entity";
import { MetaToken } from "@api/meta/entities/meta-token.entity";
import { BullModule } from "@nestjs/bullmq";
import { CommonModule } from "@shared/common.module";
import { AuditModule } from "@api/audit/audit.module";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfig, WhatsappAccount, MetaToken]),
    BullModule.registerQueue({
      name: "whatsapp-messages",
    }),
    CommonModule,
    AuditModule,
    AdminModule,
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
