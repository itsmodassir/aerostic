import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
export declare class ContactsService {
    private contactsRepository;
    constructor(contactsRepository: Repository<Contact>);
    create(createContactDto: CreateContactDto): Promise<Contact>;
    findAll(tenantId: string): Promise<Contact[]>;
}
