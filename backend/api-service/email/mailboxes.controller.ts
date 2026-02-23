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
import { MailboxesService } from "./mailboxes.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";
import { Mailbox } from "@shared/database/entities/core/mailbox.entity";

@Controller("mailboxes")
@UseGuards(JwtAuthGuard)
export class MailboxesController {
    constructor(private readonly mailboxesService: MailboxesService) { }

    @Get()
    findAll(@UserTenant() tenantId: string) {
        return this.mailboxesService.findAll(tenantId);
    }

    @Get(":id")
    findOne(@Param("id") id: string, @UserTenant() tenantId: string) {
        return this.mailboxesService.findOne(id, tenantId);
    }

    @Post()
    create(@UserTenant() tenantId: string, @Body() data: Partial<Mailbox>) {
        return this.mailboxesService.create(tenantId, data);
    }

    @Patch(":id")
    update(
        @Param("id") id: string,
        @UserTenant() tenantId: string,
        @Body() data: Partial<Mailbox>,
    ) {
        return this.mailboxesService.update(id, tenantId, data);
    }

    @Delete(":id")
    remove(@Param("id") id: string, @UserTenant() tenantId: string) {
        return this.mailboxesService.remove(id, tenantId);
    }
}
