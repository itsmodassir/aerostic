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

    if (config.isVIP !== undefined) {
      query.andWhere("contact.isVIP = :isVIP", { isVIP: config.isVIP });
    }

    if (config.group) {
        // Uses Postgres JSONB containment operator (@>)
        query.andWhere("contact.groups @> :group", {
          group: JSON.stringify([config.group]),
        });
    }

    if (config.tags && Array.isArray(config.tags) && config.tags.length > 0) {
      query.andWhere("contact.attributes->'tags' @> :tags", {
        tags: JSON.stringify(config.tags),
      });
    }

    return query.getMany();
  }

  async importContacts(tenantId: string, csvContent: string): Promise<{ imported: number; updated: number; errors: string[] }> {
    const lines = csvContent.split(/\r?\n/);
    if (lines.length < 2) return { imported: 0, updated: 0, errors: ["Empty or invalid CSV"] };

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const phoneIdx = headers.indexOf("phone");
    const nameIdx = headers.indexOf("name");
    const emailIdx = headers.indexOf("email");
    const groupsIdx = headers.indexOf("groups");

    if (phoneIdx === -1) throw new ConflictException("CSV must have a 'phone' column");

    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(",").map(v => v.trim());
        const phone = values[phoneIdx];
        if (!phone) {
            errors.push(`Line ${i+1}: Missing phone number`);
            continue;
        }

        try {
            let contact = await this.contactsRepository.findOneBy({ tenantId, phoneNumber: phone });
            const isNew = !contact;

            if (isNew) {
                contact = this.contactsRepository.create({
                    tenantId,
                    phoneNumber: phone,
                    name: values[nameIdx] || "Imported Contact",
                    email: emailIdx !== -1 ? values[emailIdx] : undefined,
                    groups: groupsIdx !== -1 ? values[groupsIdx].split(";").filter(g => g) : [],
                });
                imported++;
            } else {
                if (nameIdx !== -1 && values[nameIdx]) contact!.name = values[nameIdx];
                if (emailIdx !== -1 && values[emailIdx]) contact!.email = values[emailIdx];
                if (groupsIdx !== -1) contact!.groups = values[groupsIdx].split(";").filter(g => g);
                updated++;
            }

            await this.contactsRepository.save(contact!);
        } catch (err: any) {
            errors.push(`Line ${i+1}: ${err.message}`);
        }
    }

    return { imported, updated, errors };
  }

  async exportContacts(tenantId: string): Promise<string> {
    const contacts = await this.findAll(tenantId);
    const headers = ["Name", "Phone", "Email", "Status", "VIP", "Groups", "Added At"];
    const rows = contacts.map(c => [
        `"${c.name}"`,
        `"${c.phoneNumber}"`,
        `"${c.email || ""}"`,
        `"${c.status}"`,
        c.isVIP ? "Yes" : "No",
        `"${(c.groups || []).join(";")}"`,
        `"${c.createdAt.toISOString()}"`
    ].join(","));

    return [headers.join(","), ...rows].join("\n");
  }

  async toggleVip(id: string, tenantId: string): Promise<Contact> {
    const contact = await this.findOne(id, tenantId);
    contact.isVIP = !contact.isVIP;
    return this.contactsRepository.save(contact);
  }

  async updateGroups(id: string, tenantId: string, groups: string[]): Promise<Contact> {
    const contact = await this.findOne(id, tenantId);
    contact.groups = groups;
    return this.contactsRepository.save(contact);
  }
}
