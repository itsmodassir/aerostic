import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserTenant } from '../auth/decorators/user-tenant.decorator';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Post()
    create(@UserTenant() tenantId: string, @Body() createContactDto: CreateContactDto) {
        createContactDto.tenantId = tenantId;
        return this.contactsService.create(createContactDto);
    }

    @Get()
    findAll(@UserTenant() tenantId: string) {
        return this.contactsService.findAll(tenantId);
    }
}
