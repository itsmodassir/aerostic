import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailService } from "./email.service";
import { EmailController } from "./email.controller";
import { MailboxesController } from "./mailboxes.controller";
import { MailboxesService } from "./mailboxes.service";
import { Mailbox } from "@shared/database/entities/core/mailbox.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Mailbox])],
  controllers: [EmailController, MailboxesController],
  providers: [EmailService, MailboxesService],
  exports: [EmailService, MailboxesService],
})
export class EmailModule { }
