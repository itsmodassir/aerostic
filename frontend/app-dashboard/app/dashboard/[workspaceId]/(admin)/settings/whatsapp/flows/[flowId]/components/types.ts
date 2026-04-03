import { Node, Edge } from "@xyflow/react";

export type FlowComponentType = 
    | 'TextHeading' 
    | 'TextSubheading' 
    | 'TextBody' 
    | 'Image' 
    | 'TextInput' 
    | 'Dropdown' 
    | 'RadioButtonsGroup' 
    | 'CheckboxGroup' 
    | 'DatePicker' 
    | 'OptIn' 
    | 'Footer'
    | 'Form';

export interface FlowComponent {
    type: FlowComponentType;
    id?: string;
    text?: string;
    label?: string;
    name?: string;
    src?: string;
    required?: boolean;
    children?: FlowComponent[];
    'on-click-action'?: {
        name: string;
        next?: {
            type: 'screen';
            name: string;
        };
        payload?: Record<string, any>;
    };
}

export interface FlowScreen {
    id: string;
    title: string;
    data?: Record<string, any>;
    layout: {
        type: 'Form';
        children: FlowComponent[];
    };
}

export interface WhatsAppFlowJSON {
    version: string;
    screens: FlowScreen[];
    data_api?: Record<string, any>;
    routing?: Record<string, any>;
}

export interface ScreenNodeData extends Record<string, unknown> {
    id: string;
    title: string;
    components: FlowComponent[];
}

export type WhatsAppFlowNode = Node<ScreenNodeData>;
export type WhatsAppFlowEdge = Edge;
