import { Body, Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserTenant } from '../auth/decorators/user-tenant.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('send')
  async sendMessage(
    @UserTenant() tenantId: string,
    @Body() dto: SendMessageDto,
  ) {
    // The tenantId is extracted from the JWT token via UserTenant decorator
    // and then assigned to the DTO, ensuring it's not provided by the client.
    dto.tenantId = tenantId;
    return this.messagesService.send(dto);
  }

  @Get('conversations')
  async getConversations(@UserTenant() tenantId: string) {
    return this.messagesService.getConversations(tenantId);
  }

  @Get('conversations/:id')
  async getConversationMessages(
    @UserTenant() tenantId: string,
    @Param('id') conversationId: string,
  ) {
    return this.messagesService.getMessages(tenantId, conversationId);
  }
}
