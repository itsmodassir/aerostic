import { WhatsappService } from './whatsapp.service';
import type { Response } from 'express';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    startEmbeddedSignup(tenantId: string, res: Response): Promise<void>;
    getStatus(tenantId: string): Promise<{
        connected: boolean;
        mode: string;
        phoneNumber: string;
        wabaId: string;
    }>;
    initCloudSignup(body: {
        tenantId: string;
        phoneNumber: string;
    }): Promise<{
        status: string;
        phoneNumber: string;
    }>;
    verifyCloudSignup(body: {
        tenantId: string;
        otp: string;
    }): Promise<{
        status: string;
        wabaId: string;
    }>;
}
