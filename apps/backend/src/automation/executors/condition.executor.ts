import { Injectable, Logger } from '@nestjs/common';
import { NodeExecutor } from './executor.interface';
import { VariableResolverService } from '../variable-resolver.service';

@Injectable()
export class ConditionExecutor implements NodeExecutor {
    private readonly logger = new Logger(ConditionExecutor.name);

    constructor(private variableResolver: VariableResolverService) { }

    async execute(node: any, context: any): Promise<any> {
        const data = node.data;
        const operator = data.operator || 'contains';
        const keyword = this.variableResolver.resolve(data.keyword || '', context).toLowerCase();

        // Default input is the trigger message body or a specific variable
        const inputRaw = data.input
            ? this.variableResolver.resolve(data.input, context)
            : (context.trigger?.data?.body || '');

        const input = String(inputRaw).toLowerCase();

        let match = false;
        switch (operator) {
            case 'contains':
                match = input.includes(keyword);
                break;
            case 'equals':
                match = input === keyword;
                break;
            case 'startsWith':
                match = input.startsWith(keyword);
                break;
            case 'endsWith':
                match = input.endsWith(keyword);
                break;
            default:
                this.logger.warn(`Unsupported operator: ${operator}`);
                match = false;
        }

        this.logger.log(`Condition evaluated: "${input}" ${operator} "${keyword}" -> ${match}`);

        return {
            match,
            branch: match ? 'true' : 'false',
        };
    }
}
