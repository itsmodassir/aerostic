import { Injectable, Logger } from '@nestjs/common';
import { NodeExecutor } from './executor.interface';
import { VariableResolverService } from '../variable-resolver.service';
import { AiService } from '../../ai/ai.service';

@Injectable()
export class GeminiExecutor implements NodeExecutor {
    private readonly logger = new Logger(GeminiExecutor.name);

    constructor(
        private variableResolver: VariableResolverService,
        private aiService: AiService,
    ) { }

    async execute(node: any, context: any): Promise<any> {
        const data = node.data;

        const systemPrompt = this.variableResolver.resolve(data.systemPrompt || '', context);
        const userPrompt = this.variableResolver.resolve(data.userPrompt || '', context);
        const model = data.model || 'gemini-1.5-flash';

        this.logger.log(`Executing Gemini AI: ${model}`);

        // Note: AiService.process sends a message directly. 
        // For workflows, we might want a 'generate' method that just returns the text.
        // I'll check if AiService has a method that just returns content.
        // If not, I'll temporarily use a mocked/simplified call or suggest adding one.

        // Let's assume we use the model directly if needed, but AiService is better.
        // For now, I'll implement a simplified version that gets the model from AiService
        // or I'll implement the generation logic here if I can't find a 'generate' method.

        const result = await this.aiService.runAgent(
            context.tenantId,
            userPrompt,
            [], // No tools for now
            systemPrompt
        );

        return {
            text: result,
            model,
        };
    }
}
