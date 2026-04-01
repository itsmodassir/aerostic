import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class PinchtabService {
  private readonly logger = new Logger(PinchtabService.name);
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>("PINCHTAB_URL") || "http://localhost:9867";
  }

  async startInstance(profileId?: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/instances/start`, {
        profileId,
        mode: "headless",
      });
      return response.data.id;
    } catch (error) {
      this.logger.error(`Failed to start PinchTab instance: ${error.message}`);
      throw error;
    }
  }

  async stopInstance(instanceId: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/instances/stop`, { id: instanceId });
    } catch (error) {
      this.logger.error(`Failed to stop PinchTab instance ${instanceId}: ${error.message}`);
    }
  }

  async openTab(instanceId: string, url: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/instances/${instanceId}/tabs/open`, { url });
      return response.data.tabId;
    } catch (error) {
      this.logger.error(`Failed to open tab in instance ${instanceId}: ${error.message}`);
      throw error;
    }
  }

  async navigate(tabId: string, url: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/tabs/${tabId}/navigate`, { url });
    } catch (error) {
      this.logger.error(`Failed to navigate tab ${tabId} to ${url}: ${error.message}`);
      throw error;
    }
  }

  async snapshot(tabId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/tabs/${tabId}/snapshot?filter=interactive`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get snapshot for tab ${tabId}: ${error.message}`);
      throw error;
    }
  }

  async performAction(tabId: string, action: { kind: string; ref?: string; text?: string; key?: string }): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/tabs/${tabId}/action`, action);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to perform action ${action.kind} on tab ${tabId}: ${error.message}`);
      throw error;
    }
  }

  async getTextContent(tabId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/tabs/${tabId}/text`);
      return response.data.text;
    } catch (error) {
      this.logger.error(`Failed to get text content for tab ${tabId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * High-level method to execute a sequence of browser tasks
   */
  async executeTask(url: string, instructions: string): Promise<string> {
     let instanceId: string | null = null;
     try {
        instanceId = await this.startInstance();
        const tabId = await this.openTab(instanceId, url);
        
        // For now, just return the text content as a proof of concept
        // In a real scenario, this would be used by a tool-calling loop
        const text = await this.getTextContent(tabId);
        return text;
     } finally {
        if (instanceId) {
            await this.stopInstance(instanceId);
        }
     }
  }
}
