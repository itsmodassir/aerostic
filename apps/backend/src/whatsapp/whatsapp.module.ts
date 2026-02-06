import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { WhatsappAccount } from './entities/whatsapp-account.entity';
import { MetaToken } from '../meta/entities/meta-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfig, WhatsappAccount, MetaToken]),
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
