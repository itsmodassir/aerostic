import { Injectable, Logger } from "@nestjs/common";
import { NodeExecutor } from "./executor.interface";
import { VariableResolverService } from "../variable-resolver.service";
import { AiService } from "../../ai/ai.service";

@Injectable()
export class BrowserAgentExecutor implements NodeExecutor {
  private readonly logger = new Logger(BrowserAgentExecutor.name);

  constructor(
    private variableResolver: VariableResolverService,
    private aiService: AiService,
  ) {}

  async execute(node: any, context: any): Promise<any> {
    const data = node.data;

    const taskPrompt = this.variableResolver.resolve(
      data.taskPrompt || "",
      context,
    );
    
    const systemPrompt = this.variableResolver.resolve(
      data.systemPrompt || "You are a specialized browser automation agent. Use your tools to fulfill the user's request accurately.",
      context,
    );

    this.logger.log(`Executing Browser Agent task: ${taskPrompt.substring(0, 50)}...`);

    const result = await this.aiService.runAgent(
      context.tenantId,
      taskPrompt,
      [], // Tools are handled internally by AiService based on agent settings
      systemPrompt,
    );

    return {
      text: result,
      task: taskPrompt,
    };
  }
}
