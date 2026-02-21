import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TemplatesService } from "./templates.service";
import { TemplatesController } from "./templates.controller";
import { Template } from "./entities/template.entity";
import { MetaModule } from "../meta/meta.module";
import { WhatsappModule } from "../whatsapp/whatsapp.module";

@Module({
  imports: [TypeOrmModule.forFeature([Template]), MetaModule, WhatsappModule],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService], // Export so Campaigns can use it
})
export class TemplatesModule {}
