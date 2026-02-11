import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { WhatsappAccount } from './entities/whatsapp-account.entity';
import { MetaToken } from '../meta/entities/meta-token.entity';
import { BullModule } from '@nestjs/bullmq';
import { CommonModule } from '../common/common.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfig, WhatsappAccount, MetaToken]),
    BullModule.registerQueue({
      name: 'whatsapp-messages',
    }),
    CommonModule,
    AuditModule,
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
