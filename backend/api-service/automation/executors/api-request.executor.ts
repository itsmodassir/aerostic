import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { NodeExecutor } from "./executor.interface";
import { VariableResolverService } from "../variable-resolver.service";

@Injectable()
export class ApiRequestExecutor implements NodeExecutor {
  private readonly logger = new Logger(ApiRequestExecutor.name);

  constructor(private variableResolver: VariableResolverService) {}

  async execute(node: any, context: any): Promise<any> {
    const data = node.data;
    const method = data.method || "GET";
    const url = this.variableResolver.resolve(data.url, context);

    let headers = {};
    if (data.headers) {
      if (typeof data.headers === "string") {
        try {
          headers = JSON.parse(
            this.variableResolver.resolve(data.headers, context),
          );
        } catch (e) {
          this.logger.error(`Failed to parse headers: ${e.message}`);
        }
      } else {
        // If it's already an object
        headers = data.headers;
      }
    }

    let body = null;
    if (
      data.body &&
      (method === "POST" || method === "PUT" || method === "PATCH")
    ) {
      const resolvedBody = this.variableResolver.resolve(data.body, context);
      try {
        body = JSON.parse(resolvedBody);
      } catch (e) {
        body = resolvedBody; // Fallback to raw string
      }
    }

    this.logger.log(`Executing API Request: ${method} ${url}`);

    try {
      const response = await axios({
        method,
        url,
        data: body,
        headers,
        timeout: 30000,
      });

      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      this.logger.error(`API Request failed: ${error.message}`);
      if (error.response) {
        return {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers,
          error: true,
        };
      }
      throw error;
    }
  }
}
