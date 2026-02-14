export interface NodeExecutor {
    execute(node: any, context: any): Promise<any>;
}
