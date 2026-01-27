import { Body, Controller, Post, Get, Query, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post('send')
    // @UseGuards(JwtAuthGuard) // Enable in production
    async sendMessage(@Body() dto: SendMessageDto) {
        return this.messagesService.send(dto);
    }

    @Get('conversations')
    async getConversations(@Query('tenantId') tenantId: string) {
        return this.messagesService.getConversations(tenantId);
    }

    @Get('conversations/:id')
    async getConversationMessages(@Query('tenantId') tenantId: string, @Param('id') conversationId: string) {
        return this.messagesService.getMessages(tenantId, conversationId);
    }
}
