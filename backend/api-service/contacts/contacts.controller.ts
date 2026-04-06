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
  UseInterceptors,
  UploadedFile,
  Res,
} from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";

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

  @Get("segment")
  getSegmented(@UserTenant() tenantId: string, @Query() query: any) {
    return this.contactsService.getSegmentedContacts(tenantId, query);
  }

  @Get("export")
  async export(@UserTenant() tenantId: string, @Res() res: Response) {
    const csv = await this.contactsService.exportContacts(tenantId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=contacts-${tenantId}.csv`);
    return res.send(csv);
  }

  @Post("import")
  @UseInterceptors(FileInterceptor("file"))
  async import(
    @UserTenant() tenantId: string,
    @UploadedFile() file: any,
  ) {
    const content = file.buffer.toString("utf-8");
    return this.contactsService.importContacts(tenantId, content);
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

  @Patch(":id/vip")
  toggleVip(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.contactsService.toggleVip(id, tenantId);
  }

  @Patch(":id/groups")
  updateGroups(
    @UserTenant() tenantId: string,
    @Param("id") id: string,
    @Body("groups") groups: string[],
  ) {
    return this.contactsService.updateGroups(id, tenantId, groups);
  }

  @Delete(":id")
  remove(@UserTenant() tenantId: string, @Param("id") id: string) {
    return this.contactsService.delete(id, tenantId);
  }
}
