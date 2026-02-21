import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Contact } from "@shared/database/entities/core/contact.entity";
import { CreateContactDto } from "./dto/create-contact.dto";
import { AuditService, LogLevel, LogCategory } from "../audit/audit.service";
import { AuditLog } from "@shared/database/entities/core/audit-log.entity";

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
    private auditService: AuditService,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const existing = await this.contactsRepository.findOneBy({
      tenantId: createContactDto.tenantId,
      phoneNumber: createContactDto.phoneNumber,
    });

    if (existing) {
      throw new ConflictException(
        "Contact with this phone number already exists",
      );
    }

    const contact = this.contactsRepository.create(createContactDto);
    const saved = await this.contactsRepository.save(contact);

    // Audit contact creation
    await this.auditService.logAction(
      "SYSTEM", // Ideally pass actor info here
      "Contact Service",
      "CREATE_CONTACT",
      `Contact: ${saved.phoneNumber}`,
      saved.tenantId,
      { contactId: saved.id, name: saved.name },
      undefined,
      LogLevel.INFO,
      LogCategory.USER,
      "ContactsService",
    );

    return saved;
  }

  async findAll(tenantId: string): Promise<Contact[]> {
    return this.contactsRepository.find({
      where: { tenantId },
      order: { updatedAt: "DESC" },
      relations: ["assignedTo"],
    });
  }

  async findOne(id: string, tenantId: string): Promise<Contact> {
    const contact = await this.contactsRepository.findOne({
      where: { id, tenantId },
      relations: ["assignedTo"],
    });
    if (!contact) {
      throw new NotFoundException("Contact not found");
    }
    return contact;
  }

  async update(
    id: string,
    tenantId: string,
    updateData: Partial<Contact>,
  ): Promise<Contact> {
    const contact = await this.findOne(id, tenantId);
    Object.assign(contact, updateData);
    return this.contactsRepository.save(contact);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const contact = await this.findOne(id, tenantId);
    await this.contactsRepository.remove(contact);
  }
}
