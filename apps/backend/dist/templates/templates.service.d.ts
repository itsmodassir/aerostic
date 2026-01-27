import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';
import { MetaService } from '../meta/meta.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare class TemplatesService {
    private templateRepo;
    private metaService;
    private whatsappService;
    constructor(templateRepo: Repository<Template>, metaService: MetaService, whatsappService: WhatsappService);
    findAll(tenantId: string): Promise<Template[]>;
    sync(tenantId: string): Promise<any>;
}
