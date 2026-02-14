import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NodeExecutor } from './executor.interface';
import { VariableResolverService } from '../variable-resolver.service';
import { WorkflowMemory } from '../entities/workflow-memory.entity';

@Injectable()
export class MemoryExecutor implements NodeExecutor {
    private readonly logger = new Logger(MemoryExecutor.name);

    constructor(
        @InjectRepository(WorkflowMemory)
        private memoryRepo: Repository<WorkflowMemory>,
        private variableResolver: VariableResolverService,
    ) { }

    async execute(node: any, context: any): Promise<any> {
        const { operation = 'SET', key, value } = node.data;

        // Resolve dynamic key and value
        const resolvedKey = this.variableResolver.resolve(key, context);
        const resolvedValue = this.variableResolver.resolve(value, context);

        const tenantId = context.trigger?.tenantId || context.workspaceId;
        const contactId = context.trigger?.contactId || context.contact?.id;

        if (!tenantId) {
            throw new Error('Tenant ID is required for memory operations');
        }

        const result = await this.performOperation(operation, tenantId, contactId, resolvedKey, resolvedValue);

        // Sync with context for immediate use in same run
        if (operation === 'SET') {
            if (!context.memory) context.memory = {};
            context.memory[resolvedKey] = resolvedValue;
        }

        return result;
    }

    private async performOperation(operation: string, tenantId: string, contactId: string, key: string, value: any) {
        switch (operation) {
            case 'SET':
                return this.handleSet(tenantId, contactId, key, value);
            case 'GET':
                return this.handleGet(tenantId, contactId, key);
            case 'CLEAR':
                return this.handleClear(tenantId, contactId, key);
            default:
                throw new Error(`Unsupported memory operation: ${operation}`);
        }
    }

    private async handleSet(tenantId: string, contactId: string, key: string, value: any) {
        let memory = await this.memoryRepo.findOne({
            where: { tenantId, contactId, key }
        });

        if (memory) {
            memory.value = value;
            memory.updatedAt = new Date();
        } else {
            memory = this.memoryRepo.create({
                tenantId,
                contactId,
                key,
                value,
            });
        }

        await this.memoryRepo.save(memory);
        return { status: 'success', key, value };
    }

    private async handleGet(tenantId: string, contactId: string, key: string) {
        const memory = await this.memoryRepo.findOne({
            where: { tenantId, contactId, key }
        });

        return {
            status: 'success',
            key,
            value: memory ? memory.value : null,
            found: !!memory
        };
    }

    private async handleClear(tenantId: string, contactId: string, key: string) {
        await this.memoryRepo.delete({ tenantId, contactId, key });
        return { status: 'success', key, cleared: true };
    }
}
