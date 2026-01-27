import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Enable later

@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Post()
    create(@Body() createContactDto: CreateContactDto) {
        return this.contactsService.create(createContactDto);
    }

    @Get()
    findAll(@Query('tenantId') tenantId: string) {
        return this.contactsService.findAll(tenantId);
    }
}
