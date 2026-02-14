import { Injectable, Logger } from '@nestjs/common';
import { NodeExecutor } from './executor.interface';
import { AiService } from '../../ai/ai.service';

@Injectable()
export class KnowledgeExecutor implements NodeExecutor {
    private readonly logger = new Logger(KnowledgeExecutor.name);

    constructor(
        private aiService: AiService,
    ) { }

    async execute(node: any, context: any): Promise<any> {
        const { knowledgeBaseId, queryTemplate, limit = 3 } = node.data;

        if (!knowledgeBaseId) {
            throw new Error('Knowledge Base ID is required for knowledge query');
        }

        // Resolve the query from context if needed (already supports templating in frontend)
        // For now, let's assume the query is either direct or resolves to a string
        const query = this.resolveQuery(queryTemplate, context);

        this.logger.log(`Querying Knowledge Base ${knowledgeBaseId} with: ${query}`);

        const results = await this.aiService.findRelevantChunks(knowledgeBaseId, query, limit);

        return {
            status: 'success',
            query,
            results,
            joinedResults: results.join('\n\n'),
            foundCount: results.length
        };
    }

    private resolveQuery(template: string, context: any): string {
        if (!template) return 'Give me more information about the user request';

        // Simple resolution for now, runner will handle standard var resolution soon
        return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const parts = path.trim().split('.');
            let val = context;
            for (const part of parts) {
                val = val?.[part];
            }
            return val !== undefined ? String(val) : match;
        });
    }
}
