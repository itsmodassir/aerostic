/**
 * Centralized TypeScript type definitions for Aerostic Workflow Builder
 * 
 * This file contains all type definitions for:
 * - Workflow nodes and their data
 * - Workflow structure and edges
 * - Execution context and runtime data
 * - Validation and error types
 */

import { Node, Edge } from '@xyflow/react';

// ============================================================================
// Base Node Types
// ============================================================================

/**
 * All supported node types in the workflow builder
 */
export type NodeType =
    | 'trigger'
    | 'action'
    | 'ai_agent'
    | 'condition'
    | 'lead_update'
    | 'broadcast_trigger'
    | 'google_sheets'
    | 'contact'
    | 'template'
    | 'email'
    | 'google_drive'
    | 'openai_model'
    | 'gemini_model'
    | 'chat'
    | 'api';

/**
 * Base interface for all node data
 * Extends Record to be compatible with React Flow's Node type
 */
export interface BaseNodeData extends Record<string, unknown> {
    label: string;
    description?: string;
}

// ============================================================================
// Node-Specific Data Interfaces
// ============================================================================

/**
 * Trigger Node - Starts the workflow
 */
export interface TriggerNodeData extends BaseNodeData {
    triggerType: 'manual' | 'webhook' | 'schedule' | 'event';
    webhookUrl?: string;
    schedule?: string; // Cron expression
    eventType?: string;
}

/**
 * Action Node - Sends messages
 */
export interface ActionNodeData extends BaseNodeData {
    message: string;
    messageType: 'text' | 'template' | 'media';
    templateId?: string;
    mediaUrl?: string;
}

/**
 * AI Agent Node - Calls AI models
 */
export interface AiAgentNodeData extends BaseNodeData {
    model: 'gpt-4o' | 'gpt-4o-mini' | 'gemini-2.0-flash-exp' | 'gemini-1.5-pro' | string;
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
    tools?: string[]; // Array of tool IDs
    variableName?: string; // Where to store the response
}

/**
 * Condition Node - Conditional branching
 */
export interface ConditionNodeData extends BaseNodeData {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
    value: string;
    trueLabel?: string;
    falseLabel?: string;
}

/**
 * Lead Update Node - Updates CRM data
 */
export interface LeadUpdateNodeData extends BaseNodeData {
    field: string;
    value: string;
    operation: 'set' | 'append' | 'increment' | 'decrement';
}

/**
 * Broadcast Trigger Node - Triggers broadcast campaigns
 */
export interface BroadcastTriggerNodeData extends BaseNodeData {
    broadcastId: string;
    broadcastName?: string;
    delay?: number; // Delay in seconds
}

/**
 * Google Sheets Node - Read/write to Google Sheets
 */
export interface GoogleSheetsNodeData extends BaseNodeData {
    spreadsheetId: string;
    sheetName: string;
    operation: 'read' | 'write' | 'append' | 'update';
    range?: string;
    data?: Record<string, unknown>;
    variableName?: string; // Where to store the result
}

/**
 * Contact Node - Manage contact data
 */
export interface ContactNodeData extends BaseNodeData {
    operation: 'create' | 'update' | 'get' | 'delete';
    contactId?: string;
    fields?: Record<string, string>;
    variableName?: string;
}

/**
 * Template Node - Message templates
 */
export interface TemplateNodeData extends BaseNodeData {
    templateId: string;
    templateName?: string;
    variables?: Record<string, string>;
}

/**
 * Email Node - Send emails
 */
export interface EmailNodeData extends BaseNodeData {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
    attachments?: string[];
}

/**
 * Google Drive Node - Manage Google Drive files
 */
export interface GoogleDriveNodeData extends BaseNodeData {
    operation: 'upload' | 'download' | 'list' | 'delete' | 'share';
    fileId?: string;
    fileName?: string;
    folderId?: string;
    variableName?: string;
}

/**
 * OpenAI Model Node - OpenAI-specific configuration
 */
export interface OpenAIModelNodeData extends BaseNodeData {
    model: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo';
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'text' | 'json';
    variableName?: string;
}

/**
 * Gemini Model Node - Google Gemini-specific configuration
 */
export interface GeminiModelNodeData extends BaseNodeData {
    model: 'gemini-2.0-flash-exp' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
    variableName?: string;
}

/**
 * Chat Node - Agent handoff
 */
export interface ChatNodeData extends BaseNodeData {
    agentId?: string;
    agentName?: string;
    message?: string;
    transferType: 'human' | 'agent';
}

/**
 * API Node - HTTP requests
 */
export interface ApiNodeData extends BaseNodeData {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers?: Record<string, string>;
    body?: string;
    queryParams?: Record<string, string>;
    variableName?: string; // Where to store the response
}

/**
 * Union type of all node data types
 */
export type NodeData =
    | TriggerNodeData
    | ActionNodeData
    | AiAgentNodeData
    | ConditionNodeData
    | LeadUpdateNodeData
    | BroadcastTriggerNodeData
    | GoogleSheetsNodeData
    | ContactNodeData
    | TemplateNodeData
    | EmailNodeData
    | GoogleDriveNodeData
    | OpenAIModelNodeData
    | GeminiModelNodeData
    | ChatNodeData
    | ApiNodeData;

// ============================================================================
// Workflow Structure Types
// ============================================================================

/**
 * Workflow node with typed data
 * Uses React Flow's Node type directly for compatibility
 */
export type WorkflowNode<T extends NodeData = NodeData> = Node<T, NodeType>;

/**
 * Workflow edge/connection
 */
export interface WorkflowEdge extends Edge {
    sourceHandle?: string;
    targetHandle?: string;
    label?: string;
    animated?: boolean;
}

/**
 * Complete workflow structure
 */
export interface WorkflowJSON {
    id: string;
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    version: string;
    createdAt: Date;
    updatedAt: Date;
    workspaceId: string;
    isActive: boolean;
}

// ============================================================================
// Execution Context Types
// ============================================================================

/**
 * Variable available in the execution context
 */
export interface Variable {
    name: string;
    path: string; // e.g., "contact.name" or "nodes.api_1.output.data"
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    value?: unknown;
    description?: string;
}

/**
 * Execution context - runtime data available during workflow execution
 */
export interface ExecutionContext {
    workflowId: string;
    executionId: string;
    workspaceId: string;

    // Trigger data
    trigger: {
        type: string;
        data: Record<string, unknown>;
        timestamp: Date;
    };

    // Contact/lead data
    contact?: {
        id: string;
        name?: string;
        phone?: string;
        email?: string;
        customFields?: Record<string, unknown>;
    };

    // Node outputs - keyed by node ID
    nodes: Record<string, {
        output: unknown;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        error?: string;
        startedAt?: Date;
        completedAt?: Date;
    }>;

    // Environment variables
    env: Record<string, string>;

    // Global variables
    variables: Record<string, unknown>;
}

/**
 * Node execution result
 */
export interface NodeExecutionResult {
    nodeId: string;
    status: 'completed' | 'failed';
    output?: unknown;
    error?: string;
    executionTime: number; // milliseconds
}

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult {
    executionId: string;
    workflowId: string;
    status: 'running' | 'completed' | 'failed';
    startedAt: Date;
    completedAt?: Date;
    nodeResults: NodeExecutionResult[];
    context: ExecutionContext;
    error?: string;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation error severity
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Validation error
 */
export interface ValidationError {
    id: string;
    nodeId?: string;
    severity: ValidationSeverity;
    message: string;
    field?: string;
    code: ValidationErrorCode;
}

/**
 * Validation error codes
 */
export enum ValidationErrorCode {
    MISSING_TRIGGER = 'MISSING_TRIGGER',
    ORPHANED_NODE = 'ORPHANED_NODE',
    INFINITE_LOOP = 'INFINITE_LOOP',
    INVALID_CONNECTION = 'INVALID_CONNECTION',
    MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
    INVALID_VARIABLE = 'INVALID_VARIABLE',
    INVALID_EXPRESSION = 'INVALID_EXPRESSION',
    DUPLICATE_NODE_ID = 'DUPLICATE_NODE_ID',
    MISSING_NODE_TYPE = 'MISSING_NODE_TYPE',
}

/**
 * Validation result
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Type guard to check if a node is a specific type
 */
export function isNodeType<T extends NodeData>(
    node: WorkflowNode,
    type: NodeType
): node is WorkflowNode<T> {
    return node.type === type;
}

/**
 * Extract node data type from node type
 */
export type NodeDataForType<T extends NodeType> =
    T extends 'trigger' ? TriggerNodeData :
    T extends 'action' ? ActionNodeData :
    T extends 'ai_agent' ? AiAgentNodeData :
    T extends 'condition' ? ConditionNodeData :
    T extends 'lead_update' ? LeadUpdateNodeData :
    T extends 'broadcast_trigger' ? BroadcastTriggerNodeData :
    T extends 'google_sheets' ? GoogleSheetsNodeData :
    T extends 'contact' ? ContactNodeData :
    T extends 'template' ? TemplateNodeData :
    T extends 'email' ? EmailNodeData :
    T extends 'google_drive' ? GoogleDriveNodeData :
    T extends 'openai_model' ? OpenAIModelNodeData :
    T extends 'gemini_model' ? GeminiModelNodeData :
    T extends 'chat' ? ChatNodeData :
    T extends 'api' ? ApiNodeData :
    never;
