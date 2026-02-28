import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailService } from "./email.service";
import { EmailController } from "./email.controller";
import { MailboxesController } from "./mailboxes.controller";
import { MailboxesService } from "./mailboxes.service";
import { Mailbox } from "@shared/database/entities/core/mailbox.entity";
import { AdminModule } from "@api/admin/admin.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Mailbox]),
    forwardRef(() => AdminModule)
  ],
  controllers: [EmailController, MailboxesController],
  providers: [EmailService, MailboxesService],
  exports: [EmailService, MailboxesService],
})
export class EmailModule { }
