import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactsService {
    constructor(
        @InjectRepository(Contact)
        private contactsRepository: Repository<Contact>,
    ) { }

    async create(createContactDto: CreateContactDto): Promise<Contact> {
        const existing = await this.contactsRepository.findOneBy({
            tenantId: createContactDto.tenantId,
            phoneNumber: createContactDto.phoneNumber
        });

        if (existing) {
            throw new ConflictException('Contact with this phone number already exists');
        }

        const contact = this.contactsRepository.create(createContactDto);
        return this.contactsRepository.save(contact);
    }

    async findAll(tenantId: string): Promise<Contact[]> {
        return this.contactsRepository.find({
            where: { tenantId },
            order: { name: 'ASC' }
        });
    }
}
