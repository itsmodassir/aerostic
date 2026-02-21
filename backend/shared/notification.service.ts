import { Injectable, Logger } from "@nestjs/common";
import { MailService } from "./mail.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly adminEmail: string;

  constructor(
    private mailService: MailService,
    private config: ConfigService,
  ) {
    this.adminEmail = this.config.get<string>(
      "ADMIN_ALERT_EMAIL",
      "security-alerts@aerostic.com",
    );
  }

  async sendSecurityAlert(data: {
    title: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    message: string;
    tenantId?: string;
    metadata?: any;
  }) {
    const timestamp = new Date().toISOString();
    const fullMessage = `[${data.severity}] ${data.title}\nTime: ${timestamp}\nTenant: ${data.tenantId || "SYSTEM"}\n\n${data.message}\n\nMetadata: ${JSON.stringify(data.metadata || {}, null, 2)}`;

    this.logger.warn(
      `SYSTEM ALERT [${data.severity}]: ${data.title} - ${data.message}`,
    );

    // 1. Send Email to Admins
    if (data.severity === "HIGH" || data.severity === "CRITICAL") {
      await this.mailService
        .sendMail(
          this.adminEmail,
          `🚨 ${data.severity} Security Alert: ${data.title}`,
          `<p>${fullMessage.replace(/\n/g, "<br>")}</p>`,
          fullMessage,
        )
        .catch((err: Error) =>
          this.logger.error("Failed to send security alert email", err),
        );
    }

    // 2. Mock Slack Webhook (Production would use an actual webhook)
    if (data.severity !== "LOW") {
      this.logger.log(
        `[MOCK SLACK] Sending alert to #security-alerts: ${data.title}`,
      );
    }
  }
}
