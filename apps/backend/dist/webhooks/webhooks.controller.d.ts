import { WebhooksService } from './webhooks.service';
import type { Response } from 'express';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    verify(mode: string, token: string, challenge: string, res: Response): Response<any, Record<string, any>>;
    receive(body: any): Promise<{
        status: string;
    }>;
}
