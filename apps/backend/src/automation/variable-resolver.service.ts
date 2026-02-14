import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class VariableResolverService {
    private readonly logger = new Logger(VariableResolverService.name);

    /**
     * Resolves variables in a template string using the current execution context
     * Example: "Hello {{contact.name}}" -> "Hello Modassir"
     */
    resolve(template: string, context: any): string {
        if (!template) return '';

        return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const value = this.getValueByPath(context, path.trim());
            return value !== undefined ? String(value) : match;
        });
    }

    /**
     * Helper to get nested value from object using dot notation
     */
    private getValueByPath(obj: any, path: string): any {
        return path.split('.').reduce((prev, curr) => {
            return prev ? prev[curr] : undefined;
        }, obj);
    }

    /**
     * Extracts all variable keys from a template string
     */
    extractVariables(template: string): string[] {
        const regex = /\{\{([^}]+)\}\}/g;
        const variables = [];
        let match;
        while ((match = regex.exec(template)) !== null) {
            variables.push(match[1].trim());
        }
        return variables;
    }
}
