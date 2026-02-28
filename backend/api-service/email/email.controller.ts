import {
    Controller,
    Post,
    Body,
    UseGuards,
    BadRequestException,
} from "@nestjs/common";
import { EmailService } from "./email.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";

@Controller("email")
@UseGuards(JwtAuthGuard)
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Post("test-connection")
    async testConnection(
        @UserTenant() tenantId: string,
        @Body() config: any,
    ) {
        if (!config.host || !config.user || !config.pass) {
            throw new BadRequestException("Missing SMTP configuration fields");
        }

        try {
            await this.emailService.sendEmailWithConfig(
                config.fromEmail || config.user,
                "Aimstors Solution SMTP Test",
                "<h1>SMTP Connection Successful!</h1><p>Your SMTP settings are working correctly.</p>",
                {
                    host: config.host,
                    port: config.port,
                    secure: config.secure,
                    auth: {
                        user: config.user,
                        pass: config.pass,
                    },
                    fromEmail: config.fromEmail || config.user,
                    fromName: "Aimstors Solution Test",
                }
            );
            return { success: true, message: "Connection successful" };
        } catch (error) {
            throw new BadRequestException(`Connection failed: ${error.message}`);
        }
    }
}
