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

  /**
   * Fetches contacts matching specific segmentation criteria.
   * @param tenantId The tenant context
   * @param config Segmentation rules (tags, status, etc.)
   */
  async getSegmentedContacts(tenantId: string, config: any): Promise<Contact[]> {
    const query = this.contactsRepository.createQueryBuilder("contact")
      .where("contact.tenantId = :tenantId", { tenantId });

    if (config.status) {
      query.andWhere("contact.status = :status", { status: config.status });
    }

    if (config.tags && Array.isArray(config.tags) && config.tags.length > 0) {
      // Assuming tags are stored as an array in contact.attributes.tags
      // Uses Postgres JSONB containment operator (@>)
      query.andWhere("contact.attributes->'tags' @> :tags", {
        tags: JSON.stringify(config.tags),
      });
    }

    return query.getMany();
  }
}
