import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import * as nodemailer from "nodemailer";
import { SystemConfig } from "./database/entities/core/system-config.entity";
import { EncryptionService } from "./encryption.service";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private lastConfigHash: string = "";

  constructor(
    @InjectRepository(SystemConfig)
    private configRepo: Repository<SystemConfig>,
    private configService: ConfigService,
    private encryptionService: EncryptionService,
  ) { }

  private async getTransporter(): Promise<nodemailer.Transporter | null> {
    try {
      const configs = await this.configRepo.find({
        where: { key: Like("email.smtp_%") },
      });

      const configMap = configs.reduce((acc, curr) => {
        acc[curr.key] = curr.isSecret
          ? this.encryptionService.decrypt(curr.value)
          : curr.value;
        return acc;
      }, {} as Record<string, string>);

      const host = configMap["email.smtp_host"] || this.configService.get("SMTP_HOST");
      const port = parseInt(configMap["email.smtp_port"] || this.configService.get("SMTP_PORT", "465"));
      const user = configMap["email.smtp_user"] || this.configService.get("SMTP_USER");
      const pass = configMap["email.smtp_pass"] || this.configService.get("SMTP_PASS");
      const secure = configMap["email.smtp_secure"] === "true" || port === 465;

      const currentHash = `${host}:${port}:${user}:${pass}:${secure}`;

      if (this.transporter && this.lastConfigHash === currentHash) {
        return this.transporter;
      }

      if (host && user && pass) {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass,
          },
          // Add some timeout for faster failure detection
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
        });
        this.lastConfigHash = currentHash;
        this.logger.log(`MailService (re)initialized with host: ${host}`);
        return this.transporter;
      }

      this.logger.warn("SMTP credentials not fully configured in DB or Env.");
      return null;
    } catch (error) {
      this.logger.error("Failed to initialize SMTP transporter", error);
      return null;
    }
  }

  async sendMail(to: string, subject: string, html: string, text?: string) {
    const transporter = await this.getTransporter();

    // Fetch from details for ஒவ்வொரு call
    const fromConfig = await this.configRepo.find({
      where: { key: Like("email.from_%") },
    });
    const fromName = fromConfig.find(c => c.key === "email.from_name")?.value || "Aimstors Solution";
    const fromEmail = fromConfig.find(c => c.key === "email.from_email")?.value || "noreply@aimstore.in";

    if (!transporter) {
      this.logger.warn("=================================================");
      this.logger.warn("FALLBACK: SMTP Transporter not initialized.");
      this.logger.warn(`EMAIL TO: ${to}`);
      this.logger.warn(`SUBJECT: ${subject}`);
      this.logger.warn(`HTML CONTENT: ${html.substring(0, 500)}...`);
      this.logger.warn("=================================================");
      return { success: true, mock: true, messageId: `mock-${Date.now()}` };
    }

    try {
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
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
    const subject = "Welcome to Aimstors Solution - Your Workspace is Ready!";
    const html = `
      <h1>Welcome to Aimstors Solution, ${name}!</h1>
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
      <p>The Aimstors Solution Team</p>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendOtpEmail(to: string, otp: string) {
    const subject = `${otp} is your Aimstors Solution verification code`;
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
        <p style="color: #9ca3af; font-size: 12px;">The Aimstors Solution Team</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendInvoiceEmail(
    to: string,
    invoiceData: { id: string; amount: number; date: string },
  ) {
    const subject = `Invoice for Aimstors Solution Subscription: ${invoiceData.id}`;
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
      <p>Thank you for using Aimstors Solution!</p>
    `;
    // For now, we'll send without attachment until PDF generation is implemented
    return this.sendMail(to, subject, html);
  }
}
