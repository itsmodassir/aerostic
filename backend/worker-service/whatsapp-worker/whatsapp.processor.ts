import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import axios from "axios";
import { WhatsappService } from "@shared/whatsapp/whatsapp.service";

@Processor("whatsapp-messages")
export class WhatsappProcessor extends WorkerHost {
  private readonly logger = new Logger(WhatsappProcessor.name);

  constructor(private readonly whatsappService: WhatsappService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { tenantId, to, payload } = job.data;
    this.logger.log(`Sending message to ${to} for tenant ${tenantId}`);

    try {
      const creds = await this.whatsappService.getCredentials(tenantId);
      if (!creds || !creds.accessToken) {
        throw new Error(`Credentials missing for tenant ${tenantId}`);
      }

      const apiVersion = await this.whatsappService.getApiVersion();
      const response = await axios.post(
        `https://graph.facebook.com/${apiVersion}/${creds.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${creds.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      this.logger.log(`Message sent successfully: ${response.data.messages?.[0]?.id}`);
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      this.logger.error(`Failed to send WhatsApp message: ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }
}
