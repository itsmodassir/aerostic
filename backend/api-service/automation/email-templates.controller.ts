import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from "@nestjs/common";
import { EmailTemplatesService } from "./email-templates.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";
import { EmailTemplate } from "./entities/email-template.entity";

@Controller("email-templates")
@UseGuards(JwtAuthGuard)
export class EmailTemplatesController {
    constructor(private readonly templatesService: EmailTemplatesService) { }

    @Get()
    findAll(@UserTenant() tenantId: string) {
        return this.templatesService.findAll(tenantId);
    }

    @Get(":id")
    findOne(@Param("id") id: string, @UserTenant() tenantId: string) {
        return this.templatesService.findOne(id, tenantId);
    }

    @Post()
    create(@UserTenant() tenantId: string, @Body() data: Partial<EmailTemplate>) {
        return this.templatesService.create(tenantId, data);
    }

    @Patch(":id")
    update(
        @Param("id") id: string,
        @UserTenant() tenantId: string,
        @Body() data: Partial<EmailTemplate>,
    ) {
        return this.templatesService.update(id, tenantId, data);
    }

    @Delete(":id")
    remove(@Param("id") id: string, @UserTenant() tenantId: string) {
        return this.templatesService.remove(id, tenantId);
    }
}
