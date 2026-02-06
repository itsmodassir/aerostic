import { WhatsappService } from './whatsapp.service';
import type { Response } from 'express';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    startEmbeddedSignup(tenantId: string, res: Response): Promise<void>;
    getStatus(tenantId: string): Promise<{
        connected: boolean;
        mode?: undefined;
        phoneNumber?: undefined;
        wabaId?: undefined;
        qualityRating?: undefined;
    } | {
        connected: boolean;
        mode: string;
        phoneNumber: string;
        wabaId: string;
        qualityRating: string;
    }>;
    getPublicConfig(): Promise<{
        appId: string | undefined;
        configId: string | undefined;
    }>;
    disconnect(tenantId: string): Promise<import("typeorm").DeleteResult>;
    sendTest(tenantId: string, to: string): Promise<{
        success: boolean;
        message: string;
    }>;
    initCloudSignup(tenantId: string, body: {
        phoneNumber: string;
    }): Promise<{
        status: string;
        phoneNumber: string;
    }>;
    verifyCloudSignup(tenantId: string, body: {
        otp: string;
    }): Promise<{
        status: string;
        wabaId: string;
    }>;
}
