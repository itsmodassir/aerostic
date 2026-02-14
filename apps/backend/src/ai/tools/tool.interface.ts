export interface Tool {
    name: string;
    description: string;
    parameters: any; // JSON Schema
    execute: (args: any) => Promise<any>;
}
