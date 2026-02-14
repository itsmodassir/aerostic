import { Controller, Post, Body, Param, Query, Headers, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';

@Controller('automation/webhooks')
export class AutomationWebhooksController {
    private readonly logger = new Logger(AutomationWebhooksController.name);

    constructor(private readonly workflowsService: WorkflowsService) { }

    @Post(':workflowId')
    async triggerWebhook(
        @Param('workflowId') workflowId: string,
        @Body() body: any,
        @Query() query: any,
        @Headers() headers: any
    ) {
        this.logger.log(`Received webhook for workflow ${workflowId}`);

        try {
            // Trigger the workflow
            await this.workflowsService.executeWebhook(
                workflowId,
                {
                    body,
                    query,
                    headers
                }
            );

            return { status: 'success', message: 'Workflow triggered' };
        } catch (error) {
            this.logger.error(`Failed to trigger workflow ${workflowId}: ${error.message}`);
            throw new HttpException('Failed to trigger workflow', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
