import { Module } from "@nestjs/common";
import { WhatsappModule as SharedWhatsappModule } from "@shared/whatsapp/whatsapp.module";
import { WhatsappController } from "./whatsapp.controller";
import { AuditModule } from "@api/audit/audit.module";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [
    SharedWhatsappModule,
    AuditModule,
    AdminModule,
  ],
  controllers: [WhatsappController],
  exports: [SharedWhatsappModule],
})
export class WhatsappModule {}
