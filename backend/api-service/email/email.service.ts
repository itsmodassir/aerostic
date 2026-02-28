import { Injectable, Logger } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import * as nodemailer from "nodemailer";
import { AdminConfigService } from "@api/admin/services/admin-config.service";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private moduleRef: ModuleRef) { }

  private get adminConfigService(): AdminConfigService {
    // Lazy load to avoid circular dependency
    return this.moduleRef.get(AdminConfigService, { strict: false });
  }


  /** Build a transporter using system config (DB-driven SMTP settings) */
  private async buildTransporter() {
    const [host, portStr, secure, user, pass] = await Promise.all([
      this.adminConfigService.getValue("email.smtp_host"),
      this.adminConfigService.getValue("email.smtp_port"),
      this.adminConfigService.getValue("email.smtp_secure"),
      this.adminConfigService.getValue("email.smtp_user"),
      this.adminConfigService.getValue("email.smtp_pass"),
    ]);

    // Env vars as fallback
    const resolvedHost = host || process.env.SMTP_HOST;
    if (!resolvedHost) return null;

    return nodemailer.createTransport({
      host: resolvedHost,
      port: parseInt(portStr || process.env.SMTP_PORT || "587"),
      secure: (secure || process.env.SMTP_SECURE || "false") === "true",
      auth: {
        user: user || process.env.SMTP_USER || "",
        pass: pass || process.env.SMTP_PASS || "",
      },
    });
  }

  private async getFromAddress(): Promise<string> {
    const [fromName, fromEmail] = await Promise.all([
      this.adminConfigService.getValue("email.from_name"),
      this.adminConfigService.getValue("email.from_email"),
    ]);
    const name = fromName || process.env.SMTP_FROM_NAME || "Aerostic";
    const email =
      fromEmail || process.env.SMTP_FROM || "no-reply@aimstore.in";
    return `"${name}" <${email}>`;
  }

  private isEnabled(flag: string, envFallback: string): Promise<boolean> {
    return this.adminConfigService.getValue(flag).then((v) => {
      const val = v ?? process.env[envFallback] ?? "true";
      return val === "true";
    });
  }

  async sendEmail(to: string, subject: string, html: string, tenantId?: string) {
    this.logger.log(`Sending email to ${to}${tenantId ? ` [tenant: ${tenantId}]` : ""}`);
    const transporter = await this.buildTransporter();

    if (!transporter) {
      this.logger.warn("SMTP not configured — email skipped (mock mode).");
      return { success: true, mock: true };
    }

    try {
      const info = await transporter.sendMail({
        from: await this.getFromAddress(),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      this.logger.error(`Email send failed: ${err.message}`);
      throw err;
    }
  }

  // ─── Typed Email Senders ──────────────────────────────────────────────────

  async sendOtpEmail(to: string, otp: string, userName?: string) {
    if (!(await this.isEnabled("email.otp_enabled", "EMAIL_OTP_ENABLED"))) {
      return { skipped: true };
    }
    return this.sendEmail(
      to,
      "Your OTP Code",
      buildOtpTemplate(otp, userName),
    );
  }

  async sendWelcomeEmail(to: string, userName: string, workspaceName?: string) {
    if (!(await this.isEnabled("email.welcome_enabled", "EMAIL_WELCOME_ENABLED"))) {
      return { skipped: true };
    }
    return this.sendEmail(
      to,
      `Welcome to Aerostic${workspaceName ? `, ${workspaceName}!` : "!"}`,
      buildWelcomeTemplate(userName, workspaceName),
    );
  }

  async sendForgotPasswordEmail(to: string, resetLink: string, userName?: string) {
    if (!(await this.isEnabled("email.forgot_password_enabled", "EMAIL_FORGOT_PASSWORD_ENABLED"))) {
      return { skipped: true };
    }
    return this.sendEmail(
      to,
      "Reset Your Password",
      buildForgotPasswordTemplate(resetLink, userName),
    );
  }

  async sendPromotionalEmail(to: string, subject: string, html: string) {
    if (!(await this.isEnabled("email.promotional_enabled", "EMAIL_PROMOTIONAL_ENABLED"))) {
      return { skipped: true };
    }
    return this.sendEmail(to, subject, html);
  }

  async sendEmailWithConfig(
    to: string,
    subject: string,
    html: string,
    smtpConfig: {
      host: string;
      port: number;
      secure: boolean;
      auth: { user: string; pass: string };
      fromEmail?: string;
      fromName?: string;
    },
  ) {
    const dynamicTransporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: { user: smtpConfig.auth.user, pass: smtpConfig.auth.pass },
    });

    const from = smtpConfig.fromEmail
      ? `"${smtpConfig.fromName || "Aerostic"}" <${smtpConfig.fromEmail}>`
      : await this.getFromAddress();

    const info = await dynamicTransporter.sendMail({ from, to, subject, html });
    return { success: true, messageId: info.messageId };
  }

  /** Test SMTP connection using current system config */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const transporter = await this.buildTransporter();
      if (!transporter) return { success: false, error: "SMTP not configured" };
      await transporter.verify();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

// ─── Email HTML Templates ─────────────────────────────────────────────────────

function baseLayout(title: string, content: string) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f4f4f5; margin:0; padding:0; }
  .container { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 16px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg,#6366f1,#8b5cf6); padding:32px 40px; text-align:center; }
  .header h1 { color:#fff; margin:0; font-size:24px; font-weight:700; letter-spacing:-0.5px; }
  .body { padding:40px; color:#374151; line-height:1.6; }
  .footer { background:#f9fafb; padding:20px 40px; text-align:center; font-size:12px; color:#9ca3af; }
  .btn { display:inline-block; margin:24px 0; padding:14px 32px; background:#6366f1; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px; }
  .otp-box { font-size:40px; font-weight:800; letter-spacing:12px; color:#6366f1; text-align:center; background:#f0f0ff; padding:20px; border-radius:8px; margin:24px 0; }
</style>
</head><body>
<div class="container">
  <div class="header"><h1>Aerostic</h1></div>
  <div class="body">${content}</div>
  <div class="footer">© 2026 Aerostic. All rights reserved.<br>You received this email because you have an account with us.</div>
</div>
</body></html>`;
}

function buildOtpTemplate(otp: string, userName?: string) {
  return baseLayout(
    "Your OTP Code",
    `<p>Hi ${userName || "there"},</p>
    <p>Use the following OTP to verify your account. This code expires in <strong>10 minutes</strong>.</p>
    <div class="otp-box">${otp}</div>
    <p>If you didn't request this OTP, please ignore this email. Don't share this code with anyone.</p>`,
  );
}

function buildWelcomeTemplate(userName: string, workspaceName?: string) {
  return baseLayout(
    "Welcome to Aerostic",
    `<p>Hi ${userName},</p>
    <p>Welcome to <strong>Aerostic</strong>${workspaceName ? ` — the workspace <em>${workspaceName}</em> is ready for you` : ""}!</p>
    <p>You can now start managing your WhatsApp conversations, automations, and AI agents.</p>
    <a href="https://app.aimstore.in" class="btn">Open Dashboard →</a>
    <p>If you have any questions, feel free to reach out to our support team.</p>`,
  );
}

function buildForgotPasswordTemplate(resetLink: string, userName?: string) {
  return baseLayout(
    "Reset Your Password",
    `<p>Hi ${userName || "there"},</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <a href="${resetLink}" class="btn">Reset Password →</a>
    <p style="color:#6b7280;font-size:13px;">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email — your password won't change.</p>`,
  );
}
