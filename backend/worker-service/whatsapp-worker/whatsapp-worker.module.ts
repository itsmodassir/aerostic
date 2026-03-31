import { Module } from "@nestjs/common";
import { WhatsappModule } from "@shared/whatsapp/whatsapp.module";
import { WebhooksProcessor } from "./webhooks.processor";
import { WhatsappProcessor } from "./whatsapp.processor";

@Module({
  imports: [WhatsappModule],
  providers: [WebhooksProcessor, WhatsappProcessor],
})
export class WhatsappWorkerModule {}
