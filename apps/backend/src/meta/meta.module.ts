import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';
import { MetaToken } from './entities/meta-token.entity';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';

import { MetaTokenService } from './meta-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MetaToken, WhatsappAccount, SystemConfig]),
  ],
  controllers: [MetaController],
  providers: [MetaService, MetaTokenService],
  exports: [MetaService],
})
export class MetaModule {}
