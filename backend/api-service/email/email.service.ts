import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Default to a secure SMTP setup using environment variables
    // In a real app, these credentials should come from Tenant settings (Dynamic SMTP)
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      this.logger.log("SMTP Transporter initialized");
    } else {
      this.logger.warn(
        "SMTP_HOST not set. Email capabilities will be limited to logging.",
      );
    }
  }

  async sendEmail(to: string, subject: string, html: string, tenantId: string) {
    this.logger.log(`Attempting to send email to ${to} for tenant ${tenantId}`);

    if (!this.transporter) {
      this.logger.warn("Email transporter not configured. Mocking email send.");
      return { success: true, mock: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from:
          process.env.SMTP_FROM ||
          '"Aerostic Automation" <no-reply@aerostic.com>',
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }
}
