import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { WhatsappService } from './whatsapp.service';

@Processor('whatsapp-messages')
export class WhatsappProcessor extends WorkerHost {
    private readonly logger = new Logger(WhatsappProcessor.name);

    constructor(private readonly whatsappService: WhatsappService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { tenantId, to, payload } = job.data;

        this.logger.log(`Processing message for tenant ${tenantId} to ${to}`);

        const credentials = await this.whatsappService.getCredentials(tenantId);
        if (!credentials || !credentials.accessToken || !credentials.phoneNumberId) {
            throw new Error(`Credentials missing for tenant ${tenantId}`);
        }

        const { phoneNumberId, accessToken } = credentials;

        try {
            const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

            const { data } = await axios.post(url, payload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            this.logger.log(`Message sent successfully: ${data.messages?.[0]?.id}`);
            return { success: true, messageId: data.messages?.[0]?.id };
        } catch (error: any) {
            const errorData = error.response?.data || error.message;
            this.logger.error(`Failed to send message: ${JSON.stringify(errorData)}`);
            // Throwing error allows BullMQ to handle retries based on configuration
            throw new Error(`WhatsApp API Error: ${errorData.error?.message || error.message}`);
        }
    }
}
