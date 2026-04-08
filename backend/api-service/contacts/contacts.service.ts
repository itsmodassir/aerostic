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

  async importContacts(tenantId: string, fileBuffer: Buffer, fileName: string): Promise<{ imported: number; updated: number; errors: string[] }> {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) return { imported: 0, updated: 0, errors: ["Empty or invalid file"] };

    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    const phoneKey = keys.find(k => k.toLowerCase() === "phone" || k.toLowerCase() === "mobile");
    const nameKey = keys.find(k => k.toLowerCase() === "name" || k.toLowerCase() === "full name");
    const emailKey = keys.find(k => k.toLowerCase() === "email");
    const groupsKey = keys.find(k => k.toLowerCase() === "groups" || k.toLowerCase() === "tags");
    const countryCodeKey = keys.find(k => k.toLowerCase() === "countrycode" || k.toLowerCase() === "country_code" || k.toLowerCase() === "code");
    const isVipKey = keys.find(k => k.toLowerCase() === "isvip" || k.toLowerCase() === "vip");

    if (!phoneKey) throw new ConflictException("File must have a 'phone' or 'mobile' column");

    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        let phone = String(row[phoneKey] || "").replace(/[^0-9+]/g, "");
        if (!phone) {
            errors.push(`Row ${i+2}: Missing phone number`);
            continue;
        }

        // Normalize phone number
        if (!phone.startsWith("+") && phone.length <= 10) {
            const code = (countryCodeKey && row[countryCodeKey]) ? String(row[countryCodeKey]).replace("+", "") : "91";
            phone = "+" + code + phone;
        } else if (!phone.startsWith("+")) {
            phone = "+" + phone;
        }

        try {
            let contact = await this.contactsRepository.findOneBy({ tenantId, phoneNumber: phone });
            const isNew = !contact;

            if (isNew) {
                contact = this.contactsRepository.create({
                    tenantId,
                    phoneNumber: phone,
                    name: (nameKey && row[nameKey]) ? String(row[nameKey]) : "Imported Contact",
                    email: (emailKey && row[emailKey]) ? String(row[emailKey]) : undefined,
                    groups: (groupsKey && row[groupsKey]) ? String(row[groupsKey]).split(/[;,]/).map(g => g.trim()).filter(g => g) : [],
                    countryCode: (countryCodeKey && row[countryCodeKey]) ? String(row[countryCodeKey]).replace("+", "") : undefined,
                    isVIP: (isVipKey && row[isVipKey]) ? (String(row[isVipKey]).toLowerCase() === "yes" || String(row[isVipKey]) === "1" || row[isVipKey] === true) : false,
                });
                imported++;
            } else {
                if (nameKey && row[nameKey]) contact!.name = String(row[nameKey]);
                if (emailKey && row[emailKey]) contact!.email = String(row[emailKey]);
                if (groupsKey && row[groupsKey]) contact!.groups = String(row[groupsKey]).split(/[;,]/).map(g => g.trim()).filter(g => g);
                if (countryCodeKey && row[countryCodeKey]) contact!.countryCode = String(row[countryCodeKey]).replace("+", "");
                if (isVipKey && row[isVipKey]) contact!.isVIP = (String(row[isVipKey]).toLowerCase() === "yes" || String(row[isVipKey]) === "1" || row[isVipKey] === true);
                updated++;
            }

            await this.contactsRepository.save(contact!);
        } catch (err: any) {
            errors.push(`Row ${i+2} (${phone}): ${err.message}`);
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
