import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { Campaign } from './entities/campaign.entity';
import { ContactsModule } from '../contacts/contacts.module';
import { MessagesModule } from '../messages/messages.module';

import { BullModule } from '@nestjs/bullmq';
import { CampaignProcessor } from './campaigns.processor';

@Module({
    imports: [
        TypeOrmModule.forFeature([Campaign]),
        BullModule.registerQueue({
            name: 'campaign-queue',
        }),
        ContactsModule,
        MessagesModule,
    ],
    controllers: [CampaignsController],
    providers: [CampaignsService, CampaignProcessor],
})
export class CampaignsModule { }
