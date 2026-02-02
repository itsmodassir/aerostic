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
    disconnect(tenantId: string): Promise<import("typeorm").DeleteResult>;
    sendTest(tenantId: string, to: string): Promise<{
        success: boolean;
        messageId: any;
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
