import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    findAll(tenantId: string): Promise<import("./entities/template.entity").Template[]>;
    sync(tenantId: string): Promise<any>;
}
