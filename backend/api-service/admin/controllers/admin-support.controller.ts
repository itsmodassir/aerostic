import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { PlatformAdminOnly } from "@shared/decorators/require-role.decorator";
import { AdminInboxService } from "../services/admin-inbox.service";
import { InboxFolderName } from "../entities/email-message.entity";

@Controller("admin/support")
@PlatformAdminOnly()
export class AdminSupportController {
  constructor(private readonly inboxService: AdminInboxService) {}

  @Get("inbox/messages")
  async getInboxMessages(
    @Query("mailbox") mailbox?: string,
    @Query("folder") folder: InboxFolderName = InboxFolderName.INBOX,
  ) {
    return this.inboxService.getMessages(mailbox, folder);
  }

  @Get("inbox/messages/:id")
  async getInboxMessage(@Param("id") id: string) {
    return this.inboxService.getMessageById(id);
  }

  @Patch("inbox/messages/:id/read")
  async markInboxMessageRead(@Param("id") id: string) {
    return this.inboxService.markAsRead(id);
  }

  @Post("inbox/messages/send")
  async sendInboxMessage(
    @Body()
    dto: {
      mailbox: string;
      to: string;
      subject: string;
      content: string;
    },
  ) {
    return this.inboxService.sendMessage(
      dto.mailbox,
      dto.to,
      dto.subject,
      dto.content,
    );
  }

  @Post("inbox/messages/receive")
  async receiveInboxMessage(
    @Body()
    dto: {
      mailbox: string;
      from: string;
      to: string;
      subject: string;
      content: string;
    },
  ) {
    return this.inboxService.receiveMessage(
      dto.mailbox,
      dto.from,
      dto.to,
      dto.subject,
      dto.content,
    );
  }

  @Delete("inbox/messages/:id")
  async deleteInboxMessage(@Param("id") id: string) {
    return this.inboxService.deleteMessage(id);
  }
}
