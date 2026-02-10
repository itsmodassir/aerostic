import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { Message } from './entities/message.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { Conversation } from './entities/conversation.entity';
import { MetaToken } from '../meta/entities/meta-token.entity'; // Need to decrypt
import { SendMessageDto } from './dto/send-message.dto';
import axios from 'axios';
import { MessagesGateway } from './messages.gateway';
import { AuditService } from '../audit/audit.service';
import { LogCategory, LogLevel } from '../audit/entities/audit-log.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(WhatsappAccount)
    private whatsappAccountRepo: Repository<WhatsappAccount>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(MetaToken)
    private metaTokenRepo: Repository<MetaToken>,
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    private messagesGateway: MessagesGateway,
    private auditService: AuditService,
  ) { }

  async send(dto: SendMessageDto) {
    // 1. Resolve Tenant's WhatsApp Account
    const account = await this.whatsappAccountRepo.findOneBy({
      tenantId: dto.tenantId,
    });
    if (!account) {
      throw new NotFoundException('WhatsApp account not found for this tenant');
    }

    // 2. Resolve Contact & Conversation (Prerequisite for storage)
    let contact = await this.contactRepo.findOneBy({
      tenantId: dto.tenantId,
      phoneNumber: dto.to,
    });
    if (!contact) {
      contact = this.contactRepo.create({
        tenantId: dto.tenantId,
        phoneNumber: dto.to,
        name: dto.to, // Default name
      });
      await this.contactRepo.save(contact);
    }

    let conversation = await this.conversationRepo.findOne({
      where: { tenantId: dto.tenantId, contactId: contact.id, status: 'open' },
    });

    if (!conversation) {
      conversation = this.conversationRepo.create({
        tenantId: dto.tenantId,
        contactId: contact.id,
        phoneNumberId: account.phoneNumberId,
        status: 'open',
        lastMessageAt: new Date(),
      });
      await this.conversationRepo.save(conversation);
    } else {
      conversation.lastMessageAt = new Date();
      await this.conversationRepo.save(conversation);
    }

    // 3. Get System Token
    const tokenRecord = await this.metaTokenRepo.findOne({
      where: { tokenType: 'system' },
      order: { createdAt: 'DESC' },
    });

    if (!tokenRecord) {
      throw new InternalServerErrorException(
        'System token configuration missing',
      );
    }

    const token = tokenRecord.encryptedToken; // TODO: Decrypt here

    // 4. Construct Meta Graph API Payload
    const url = `https://graph.facebook.com/v18.0/${account.phoneNumberId}/messages`;

    const body: any = {
      messaging_product: 'whatsapp',
      to: dto.to,
      type: dto.type,
    };

    if (dto.type === 'text') {
      body.text = { body: dto.payload.text };
    } else if (dto.type === 'template') {
      body.template = dto.payload;
    }

    // 5. Send Request
    try {
      const response = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const metaId = response.data.messages?.[0]?.id;

      // 6. Save Outbound Message to DB
      const message = this.messageRepo.create({
        tenantId: dto.tenantId,
        conversationId: conversation.id,
        direction: 'out',
        type: dto.type,
        content: dto.type === 'text' ? { body: dto.payload.text } : dto.payload,
        metaMessageId: metaId,
        status: 'sent',
      });
      await this.messageRepo.save(message);

      // 🔥 REAL-TIME EVENT: Emit to all connected clients in this tenant's room
      this.messagesGateway.emitNewMessage(dto.tenantId || '', {
        conversationId: conversation.id,
        contactId: contact.id,
        phone: dto.to,
        direction: 'out',
        type: dto.type,
        content: dto.type === 'text' ? { body: dto.payload.text } : dto.payload,
        timestamp: new Date(),
      });

      // Audit message sending
      await this.auditService.logAction(
        'SYSTEM',
        'Message Service',
        'SEND_WHATSAPP_MESSAGE',
        `Destination: ${dto.to}`,
        dto.tenantId,
        {
          messageId: message.id,
          metaId,
          type: dto.type,
          conversationId: conversation.id
        },
        undefined,
        LogLevel.SUCCESS,
        LogCategory.WHATSAPP,
        'MessagesService'
      );

      return { sent: true, metaId, messageId: message.id };
    } catch (error) {
      console.error('Meta API Error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to send WhatsApp message');
    }
  }

  async getConversations(tenantId: string) {
    return this.conversationRepo.find({
      where: { tenantId, status: 'open' },
      relations: ['contact'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  async getMessages(tenantId: string, conversationId: string) {
    return this.messageRepo.find({
      where: { tenantId, conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async cleanupMockData() {
    const mockNames = [
      'Vikram Singh',
      'Neha Gupta',
      'Ravi Mehta',
      'Anjali Sharma',
    ];

    // Delete contacts (cascading should handle conversations/messages usually, but we'll check)
    // If cascade isn't set up, we might need to delete conversations first.
    // Assuming cascade or manual cleanup:

    const contacts = await this.contactRepo
      .createQueryBuilder('contact')
      .where('contact.name IN (:...names)', { names: mockNames })
      .getMany();

    if (contacts.length === 0) return { deleted: 0 };

    const contactIds = contacts.map((c) => c.id);

    // Delete conversations for these contacts
    await this.conversationRepo
      .createQueryBuilder()
      .delete()
      .from(Conversation)
      .where('contactId IN (:...ids)', { ids: contactIds })
      .execute();

    // Delete contacts
    const result = await this.contactRepo
      .createQueryBuilder()
      .delete()
      .from(Contact)
      .where('id IN (:...ids)', { ids: contactIds })
      .execute();

    return { deleted: result.affected || 0 };
  }
}
