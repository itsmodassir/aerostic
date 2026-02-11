import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 465);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`MailService initialized with host: ${host}`);
    } else {
      this.logger.warn(
        'SMTP credentials not fully configured. Emails will not be sent.',
      );
    }
  }

  async sendMail(to: string, subject: string, html: string, text?: string) {
    if (!this.transporter) {
      this.logger.error('Transporter not initialized. Cannot send email.');
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>(
          'SMTP_FROM',
          '"Aerostic" <noreply@aerostic.com>',
        ),
        to,
        subject,
        text: text || subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    const subject = 'Welcome to Aerostic - Your Workspace is Ready!';
    const html = `
      <h1>Welcome to Aerostic, ${name}!</h1>
      <p>We're excited to have you on board. Your workspace has been successfully created.</p>
      <p>Next steps:</p>
      <ul>
        <li>Set up your WhatsApp Business account.</li>
        <li>Connect your AI agents.</li>
        <li>Start automating your customer engagement.</li>
      </ul>
      <p>If you have any questions, feel free to reply to this email or reach out to our support team.</p>
      <br>
      <p>Cheers,</p>
      <p>The Aerostic Team</p>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendOtpEmail(to: string, otp: string) {
    const subject = `${otp} is your Aerostic verification code`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h1 style="color: #2563eb;">Verify your login</h1>
        <p>Your one-time password (OTP) is:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          This code will expire in 5 minutes. If you didn't request this, please ignore this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">The Aerostic Team</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendInvoiceEmail(
    to: string,
    invoiceData: { id: string; amount: number; date: string },
  ) {
    const subject = `Invoice for Aerostic Subscription: ${invoiceData.id}`;
    const html = `
      <h1>Your Invoice is Ready</h1>
      <p>A new invoice has been generated for your recent subscription payment.</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
        <p><strong>Invoice ID:</strong> ${invoiceData.id}</p>
        <p><strong>Amount:</strong> ₹${invoiceData.amount}</p>
        <p><strong>Date:</strong> ${invoiceData.date}</p>
      </div>
      <p>You can find the attached PDF invoice for your records.</p>
      <br>
      <p>Thank you for using Aerostic!</p>
    `;
    // For now, we'll send without attachment until PDF generation is implemented
    return this.sendMail(to, subject, html);
  }
}
