import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CampaignsService } from "./campaigns.service";
import { CampaignsController } from "./campaigns.controller";
import { Campaign } from "./entities/campaign.entity";
import { ContactsModule } from "../contacts/contacts.module";
import { MessagesModule } from "../messages/messages.module";

import { BullModule } from "@nestjs/bullmq";
import { CampaignProcessor } from "./campaigns.processor";
import { AuditModule } from "../audit/audit.module";
import { AdminModule } from "../admin/admin.module";
import { BillingModule } from "../billing/billing.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign]),
    BullModule.registerQueue({
      name: "campaign-queue",
    }),
    ContactsModule,
    MessagesModule,
    AuditModule,
    forwardRef(() => AdminModule),
    forwardRef(() => BillingModule),
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService, CampaignProcessor],
})
export class CampaignsModule { }
