import { Module, forwardRef } from "@nestjs/common";
import { AiService } from "./ai.service";
import { PinchtabService } from "./pinchtab.service";
import { MessagesModule } from "../messages/messages.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AiAgent } from "./entities/ai-agent.entity";
import { KnowledgeBase } from "./entities/knowledge-base.entity";
import { KnowledgeChunk } from "./entities/knowledge-chunk.entity";
import { AiController } from "./ai.controller";
import { AuditModule } from "../audit/audit.module";
import { KnowledgeBaseService } from "./knowledge-base.service";
import { AdminModule } from "../admin/admin.module";
import { Campaign } from "../campaigns/entities/campaign.entity";
import { BillingModule } from "../billing/billing.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([AiAgent, KnowledgeBase, KnowledgeChunk, Campaign]),
    forwardRef(() => MessagesModule),
    AuditModule,
    AdminModule,
    forwardRef(() => BillingModule),
  ],
  controllers: [AiController],
  providers: [PinchtabService, KnowledgeBaseService, AiService],
  exports: [AiService, KnowledgeBaseService, PinchtabService],
})
export class AiModule {}
