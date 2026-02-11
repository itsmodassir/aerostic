import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EmailMessage,
  InboxFolderName,
} from '../entities/email-message.entity';
import { MailService } from '../../common/mail.service';

@Injectable()
export class AdminInboxService {
  private readonly logger = new Logger(AdminInboxService.name);

  constructor(
    @InjectRepository(EmailMessage)
    private emailRepo: Repository<EmailMessage>,
    private mailService: MailService,
  ) {}

  async getMessages(
    mailbox?: string,
    folder: InboxFolderName = InboxFolderName.INBOX,
  ) {
    const where: any = { folder };
    if (mailbox) {
      where.mailbox = mailbox;
    }
    return this.emailRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async getMessageById(id: string) {
    return this.emailRepo.findOne({ where: { id } });
  }

  async markAsRead(id: string) {
    await this.emailRepo.update(id, { isRead: true });
    return { success: true };
  }

  async sendMessage(
    mailbox: string,
    to: string,
    subject: string,
    content: string,
  ) {
    // 1. Send via MailService
    await this.mailService.sendMail(to, subject, content);

    // 2. Save to Sent folder
    const message = this.emailRepo.create({
      mailbox,
      from: mailbox + '@aerostic.com',
      to,
      subject,
      content,
      folder: InboxFolderName.SENT,
      isRead: true,
    });
    return this.emailRepo.save(message);
  }

  async receiveMessage(
    mailbox: string,
    from: string,
    to: string,
    subject: string,
    content: string,
  ) {
    const message = this.emailRepo.create({
      mailbox,
      from,
      to,
      subject,
      content,
      folder: InboxFolderName.INBOX,
      isRead: false,
    });
    return this.emailRepo.save(message);
  }

  async deleteMessage(id: string) {
    await this.emailRepo.delete(id);
    return { success: true };
  }
}
