import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";

@Controller("contacts")
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(
    @UserTenant() tenantId: string,
    @Body() createContactDto: CreateContactDto,
  ) {
    createContactDto.tenantId = tenantId;
    return this.contactsService.create(createContactDto);
  }

  @Get()
  findAll(@UserTenant() tenantId: string) {
    return this.contactsService.findAll(tenantId);
  }

  @Get(":id")
  findOne(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.contactsService.findOne(id, tenantId);
  }

  @Patch(":id")
  update(
    @UserTenant() tenantId: string,
    @Param("id") id: string,
    @Body() updateData: any,
  ) {
    return this.contactsService.update(id, tenantId, updateData);
  }

  @Delete(":id")
  remove(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.contactsService.delete(id, tenantId);
  }
}
