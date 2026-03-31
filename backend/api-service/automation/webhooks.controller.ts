import {
  Controller,
  Post,
  Body,
  Param,
  Query,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WorkflowsService } from "./workflows.service";

@Controller("automation/webhooks")
export class AutomationWebhooksController {
  private readonly logger = new Logger(AutomationWebhooksController.name);

  constructor(
    private readonly workflowsService: WorkflowsService,
    private readonly configService: ConfigService,
  ) {}

  @Post("internal/trigger")
  async triggerByType(
    @Body() body: any,
    @Headers("x-automation-secret") secret?: string,
  ) {
    const expected =
      this.configService.get<string>("AUTOMATION_TRIGGER_SECRET") ||
      this.configService.get<string>("META_APP_SECRET");
    if (!expected || secret !== expected) {
      throw new UnauthorizedException("Invalid automation trigger secret");
    }

    const tenantId = String(body?.tenantId || "");
    const triggerType = String(body?.triggerType || "");
    const context = body?.context || {};

    if (!tenantId || !triggerType) {
      throw new HttpException(
        "tenantId and triggerType are required",
        HttpStatus.BAD_REQUEST,
      );
    }

    const handled = await this.workflowsService.executeTrigger(
      tenantId,
      triggerType,
      context,
    );

    return { status: "success", handled };
  }

  @Post(":workflowId")
  async triggerWebhook(
    @Param("workflowId") workflowId: string,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
  ) {
    this.logger.log(`Received webhook for workflow ${workflowId}`);

    try {
      // Trigger the workflow
      await this.workflowsService.executeWebhook(workflowId, {
        body,
        query,
        headers,
      });

      return { status: "success", message: "Workflow triggered" };
    } catch (error) {
      this.logger.error(
        `Failed to trigger workflow ${workflowId}: ${error.message}`,
      );
      throw new HttpException(
        "Failed to trigger workflow",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
