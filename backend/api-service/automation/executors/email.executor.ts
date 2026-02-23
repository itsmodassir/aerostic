import { Injectable, Logger } from "@nestjs/common";
import { NodeExecutor } from "./executor.interface";
import { VariableResolverService } from "../variable-resolver.service";
import { EmailService } from "../../email/email.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Mailbox } from "@shared/database/entities/core/mailbox.entity";
import { EmailTemplate } from "@shared/database/entities/messaging/email-template.entity";

@Injectable()
export class EmailExecutor implements NodeExecutor {
    private readonly logger = new Logger(EmailExecutor.name);

    constructor(
        private variableResolver: VariableResolverService,
        private emailService: EmailService,
        @InjectRepository(Mailbox)
        private mailboxRepo: Repository<Mailbox>,
        @InjectRepository(EmailTemplate)
        private templateRepo: Repository<EmailTemplate>,
    ) { }

    async execute(node: any, context: any): Promise<any> {
        const data = node.data; // EmailNodeData
        const tenantId = context.tenantId;

        const smtpSource = data.smtpSource || "system"; // system | personal
        const contentSource = data.contentSource || "direct"; // direct | template

        let to = this.variableResolver.resolve(data.to || "{{contact.email}}", context);
        let subject = data.subject || "";
        let body = "";

        // 1. Resolve Content
        if (contentSource === "template" && data.templateId) {
            const template = await this.templateRepo.findOne({
                where: { id: data.templateId, tenantId },
            });
            if (!template) {
                throw new Error(`Email template not found: ${data.templateId}`);
            }
            subject = subject || template.subject;
            body = template.content;
        } else {
            body = data.body || "";
        }

        // Resolve variables in final subject and body
        subject = this.variableResolver.resolve(subject, context);
        body = this.variableResolver.resolve(body, context);

        if (!to || !to.includes("@")) {
            this.logger.warn(`Invalid or missing recipient email: ${to}`);
            return { status: "skipped", reason: "invalid_email" };
        }

        // 2. Fetch Mailbox Config based on smtpSource
        let mailbox = null;
        if (smtpSource === "personal") {
            mailbox = await this.mailboxRepo.findOne({
                where: {
                    tenantId,
                    isActive: true,
                    ...(data.mailboxId ? { id: data.mailboxId } : {})
                },
            });
        }

        if (!mailbox || !mailbox.smtpConfig) {
            if (smtpSource === "personal") {
                this.logger.warn(`Personal mailbox not found or inactive for tenant ${tenantId}. Falling back to default.`);
            }
            // Use system default
            await this.emailService.sendEmail(to, subject, body, tenantId);
            return { status: "sent", provider: "system_default", to, subject };
        }

        // 3. Send via Dynamic SMTP
        this.logger.log(`Sending email to ${to} via mailbox ${mailbox.emailAddress}`);

        await this.emailService.sendEmailWithConfig(to, subject, body, {
            host: mailbox.smtpConfig.host,
            port: mailbox.smtpConfig.port,
            secure: mailbox.smtpConfig.secure,
            auth: {
                user: mailbox.smtpConfig.user || mailbox.smtpConfig.auth?.user,
                pass: mailbox.smtpConfig.pass || mailbox.smtpConfig.auth?.pass,
            },
            fromEmail: mailbox.emailAddress,
            fromName: mailbox.name,
        });

        return {
            status: "sent",
            to,
            subject,
            provider: "personal_smtp",
            mailbox: mailbox.emailAddress,
        };
    }
}
