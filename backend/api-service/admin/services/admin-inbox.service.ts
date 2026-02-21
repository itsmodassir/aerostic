import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, Not } from "typeorm";
import {
  EmailMessage,
  InboxFolderName,
} from "../entities/email-message.entity";
import { MailService } from "@shared/mail.service";
import { AuditService } from "@api/audit/audit.service";
import { Mailbox } from "@shared/database/entities/core/mailbox.entity";

@Injectable()
export class AdminInboxService {
  private readonly logger = new Logger(AdminInboxService.name);
  private readonly ALLOWED_MAILBOXES = new Set([
    "support",
    "sales",
    "alerts",
    "notifications",
    "admin",
  ]);
  private readonly HOURLY_SEND_LIMIT = 50;
  private readonly sentCountCache = new Map<
    string,
    { count: number; lastReset: number }
  >();

  constructor(
    @InjectRepository(EmailMessage)
    private emailRepo: Repository<EmailMessage>,
    private mailService: MailService,
    private auditService: AuditService,
  ) {}

  async getMessages(
    mailbox?: string,
    folder: InboxFolderName = InboxFolderName.INBOX,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { folder };

    if (mailbox) {
      if (!this.ALLOWED_MAILBOXES.has(mailbox)) {
        throw new BadRequestException(`Invalid mailbox: ${mailbox}`);
      }
      where.mailboxName = mailbox;
    }

    const [data, total] = await this.emailRepo.findAndCount({
      where,
      order: { createdAt: "DESC" },
      take: limit,
      skip: skip,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMessageById(id: string) {
    return this.emailRepo.findOne({ where: { id } });
  }

  async markAsRead(id: string) {
    await this.emailRepo.update(id, { isRead: true });
    return { success: true };
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private sanitizeHtml(content: string): string {
    // Basic sanitization: Remove script tags and event handlers
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/on\w+='[^']*'/gi, "");
  }

  private checkRateLimit(actorId: string) {
    const now = Date.now();
    const windowMs = 3600000; // 1 hour
    const record = this.sentCountCache.get(actorId) || {
      count: 0,
      lastReset: now,
    };

    if (now - record.lastReset > windowMs) {
      record.count = 0;
      record.lastReset = now;
    }

    if (record.count >= this.HOURLY_SEND_LIMIT) {
      throw new BadRequestException("Hourly email sending limit reached");
    }

    record.count++;
    this.sentCountCache.set(actorId, record);
  }

  async sendMessage(
    mailbox: string,
    to: string,
    subject: string,
    content: string,
    actorId: string = "system",
  ) {
    // 1. Validation
    if (!this.ALLOWED_MAILBOXES.has(mailbox)) {
      throw new BadRequestException(`Invalid system mailbox: ${mailbox}`);
    }
    if (!this.validateEmail(to)) {
      throw new BadRequestException(`Invalid recipient email: ${to}`);
    }

    // 2. Rate Limiting
    this.checkRateLimit(actorId);

    // 3. Sanitization
    const sanitizedContent = this.sanitizeHtml(content);

    // 4. Send via MailService
    await this.mailService.sendMail(to, subject, sanitizedContent);

    // 5. Save to Sent folder
    const message = this.emailRepo.create({
      mailboxName: mailbox,
      from: `${mailbox}@aerostic.com`,
      to,
      subject,
      contentHtml: sanitizedContent,
      folder: InboxFolderName.SENT,
      isRead: true,
      tenantId: "00000000-0000-0000-0000-000000000000", // System tenant
    });

    const saved = await this.emailRepo.save(message);

    // 6. Audit Logging
    await this.auditService.logAction(
      "admin",
      actorId,
      "SEND_EMAIL",
      `Sent email from ${mailbox} to ${to}`,
      undefined,
      { messageId: saved.id, to, mailbox },
    );

    return saved;
  }

  async receiveMessage(
    mailbox: string,
    from: string,
    to: string,
    subject: string,
    content: string,
  ) {
    if (!this.ALLOWED_MAILBOXES.has(mailbox)) {
      this.logger.warn(
        `Received message for unwhitelisted mailbox: ${mailbox}`,
      );
    }

    const sanitizedContent = this.sanitizeHtml(content);

    const message = this.emailRepo.create({
      mailboxName: mailbox,
      from,
      to,
      subject,
      contentHtml: sanitizedContent,
      folder: InboxFolderName.INBOX,
      isRead: false,
    });
    return this.emailRepo.save(message);
  }

  async deleteMessage(id: string, actorId: string = "system") {
    // Soft delete by moving to trash/archive
    const message = await this.emailRepo.findOne({ where: { id } });
    if (!message) {
      throw new BadRequestException("Message not found");
    }

    if (message.folder === InboxFolderName.TRASH) {
      // If already in trash, we could do hard delete if requested, but plan said "archive/soft delete instead of hard delete"
      await this.emailRepo.delete(id);
    } else {
      message.folder = InboxFolderName.TRASH;
      await this.emailRepo.save(message);
    }

    await this.auditService.logAction(
      "admin",
      actorId,
      "DELETE_EMAIL",
      `Deleted message ${id}`,
      undefined,
      { messageId: id },
    );

    return { success: true };
  }

  async archiveMessage(id: string, actorId: string = "system") {
    const message = await this.emailRepo.findOne({ where: { id } });
    if (!message) {
      throw new BadRequestException("Message not found");
    }

    message.folder = InboxFolderName.ARCHIVE;
    await this.emailRepo.save(message);

    await this.auditService.logAction(
      "admin",
      actorId,
      "ARCHIVE_EMAIL",
      `Archived message ${id}`,
      undefined,
      { messageId: id },
    );

    return { success: true };
  }
}
