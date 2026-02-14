import { Injectable, Logger } from '@nestjs/common';
import { NodeExecutor } from './executor.interface';
import { VariableResolverService } from '../variable-resolver.service';
import { ContactsService } from '../../contacts/contacts.service';

@Injectable()
export class LeadUpdateExecutor implements NodeExecutor {
    private readonly logger = new Logger(LeadUpdateExecutor.name);

    constructor(
        private variableResolver: VariableResolverService,
        private contactsService: ContactsService,
    ) { }

    async execute(node: any, context: any): Promise<any> {
        const data = node.data;
        const tenantId = context.tenantId;
        const contactId = context.contact?.id;

        if (!contactId) {
            this.logger.warn('No contact found in execution context for lead update');
            return { status: 'skipped', reason: 'no_contact' };
        }

        const updateData: any = {};

        if (data.status) updateData.status = data.status;
        if (data.stage) updateData.stage = data.stage;
        if (data.tags) {
            const resolvedTags = this.variableResolver.resolve(data.tags, context);
            updateData.tags = resolvedTags.split(',').map(t => t.trim());
        }

        this.logger.log(`Executing Lead Update for contact ${contactId}: ${JSON.stringify(updateData)}`);

        await this.contactsService.update(tenantId, contactId, updateData);

        return {
            status: 'updated',
            contactId,
            updates: updateData,
        };
    }
}
