import { Injectable, Logger } from '@nestjs/common';
import { NodeExecutor } from './executor.interface';
import { VariableResolverService } from '../variable-resolver.service';
import { MessagesService } from '../../messages/messages.service';

@Injectable()
export class ActionExecutor implements NodeExecutor {
    private readonly logger = new Logger(ActionExecutor.name);

    constructor(
        private variableResolver: VariableResolverService,
        private messagesService: MessagesService,
    ) { }

    async execute(node: any, context: any): Promise<any> {
        const data = node.data;
        const tenantId = context.tenantId;
        const to = context.contact?.phone || context.trigger?.data?.from;

        if (!to) {
            throw new Error('Destination phone number not found in context');
        }

        const message = this.variableResolver.resolve(data.message || '', context);

        this.logger.log(`Executing Action: Send Message to ${to}`);

        await this.messagesService.send({
            tenantId,
            to,
            type: 'text',
            payload: { text: message },
        });

        return {
            status: 'sent',
            to,
            message,
        };
    }
}
