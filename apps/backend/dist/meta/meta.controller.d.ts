import { MetaService } from './meta.service';
export declare class MetaController {
    private readonly metaService;
    constructor(metaService: MetaService);
    metaCallback(code: string, tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
