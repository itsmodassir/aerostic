import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WaForm } from "./entities/wa-form.entity";
import { WaFormsService } from "./wa-forms.service";
import { WaFormsController } from "./wa-forms.controller";
import { WhatsappModule } from "@api/whatsapp/whatsapp.module";

@Module({
  imports: [TypeOrmModule.forFeature([WaForm]), WhatsappModule],
  controllers: [WaFormsController],
  providers: [WaFormsService],
  exports: [WaFormsService],
})
export class WaFormsModule {}

