import {
    Headphones,
    ShoppingCart,
    MessageSquare,
    Zap,
    UserCheck,
    HelpCircle
} from 'lucide-react';

export interface AgentTemplate {
    id: string;
    name: string;
    type: 'customer_support' | 'sales' | 'lead_followup' | 'faq' | 'custom';
    description: string;
    icon: any;
    color: string;
    systemPrompt: string;
    initialNodes: any[];
    initialEdges: any[];
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
    {
        id: 'support_pro',
        name: 'Support Expert',
        type: 'customer_support',
        description: 'Automated 24/7 customer support with knowledge base integration and human handoff.',
        icon: Headphones,
        color: 'blue',
        systemPrompt: "You are a professional Customer Support Agent. Your goal is to help users resolve their issues using the provided knowledge base. \n\nRULES:\n1. Be polite and empathetic.\n2. If you don't know the answer, ask for clarification.\n3. If the user is frustrated or asks for a human, reply with 'HANDOFF_TO_HUMAN'.\n4. Keep responses concise.",
        initialNodes: [
            {
                id: '1',
                type: 'trigger',
                data: { label: 'On Message Received' },
                position: { x: 250, y: 5 },
            },
            {
                id: '2',
                type: 'aiAgent',
                data: { label: 'Support AI' },
                position: { x: 250, y: 150 },
            },
            {
                id: '3',
                type: 'message',
                data: { label: 'Send Reply' },
                position: { x: 250, y: 300 },
            }
        ],
        initialEdges: [
            { id: 'e1-2', source: '1', target: '2', animated: true },
            { id: 'e2-3', source: '2', target: '3', animated: true },
        ]
    },
    {
        id: 'sales_accelerator',
        name: 'Sales Assistant',
        type: 'sales',
        description: 'Qualify leads, answer product questions, and drive conversions effectively.',
        icon: ShoppingCart,
        color: 'green',
        systemPrompt: "You are a high-energy Sales Assistant. Your goal is to qualify leads and guide them toward a purchase.\n\nRULES:\n1. Focus on benefits, not just features.\n2. Ask qualifying questions (budget, timeline).\n3. Use a persuasive but helpful tone.\n4. Call to action: Encourage them to book a demo or visit the pricing page.",
        initialNodes: [
            {
                id: '1',
                type: 'trigger',
                data: { label: 'On Message Received' },
                position: { x: 250, y: 5 },
            },
            {
                id: '2',
                type: 'aiAgent',
                data: { label: 'Sales AI' },
                position: { x: 250, y: 150 },
            },
            {
                id: '3',
                type: 'message',
                data: { label: 'Send Pitch' },
                position: { x: 250, y: 300 },
            }
        ],
        initialEdges: [
            { id: 'e1-2', source: '1', target: '2', animated: true },
            { id: 'e2-3', source: '2', target: '3', animated: true },
        ]
    },
    {
        id: 'faq_master',
        name: 'FAQ Bot',
        type: 'faq',
        description: 'Perfect for answering repetitive questions and basic business info.',
        icon: HelpCircle,
        color: 'amber',
        systemPrompt: "You are a helpful FAQ assistant. Answer questions based purely on the facts provided in the knowledge base.\n\nRULES:\n1. If the answer isn't in the knowledge base, state that you don't have that information.\n2. Provide links to the website if applicable.\n3. Be very direct and brief.",
        initialNodes: [
            {
                id: '1',
                type: 'trigger',
                data: { label: 'On Message Received' },
                position: { x: 250, y: 5 },
            },
            {
                id: '2',
                type: 'aiAgent',
                data: { label: 'FAQ Brain' },
                position: { x: 250, y: 150 },
            },
            {
                id: '3',
                type: 'message',
                data: { label: 'Answer User' },
                position: { x: 250, y: 300 },
            }
        ],
        initialEdges: [
            { id: 'e1-2', source: '1', target: '2', animated: true },
            { id: 'e2-3', source: '2', target: '3', animated: true },
        ]
    },
    {
        id: 'base_ai',
        name: 'Basic Assistant',
        type: 'custom',
        description: 'A clean slate for you to customize your own AI behavior from scratch.',
        icon: MessageSquare,
        color: 'gray',
        systemPrompt: "You are a helpful AI assistant. Answer the user's questions clearly.",
        initialNodes: [
            {
                id: '1',
                type: 'trigger',
                data: { label: 'On Message Received' },
                position: { x: 250, y: 5 },
            },
            {
                id: '2',
                type: 'aiAgent',
                data: { label: 'AI Brain' },
                position: { x: 250, y: 150 },
            },
            {
                id: '3',
                type: 'message',
                data: { label: 'Send Response' },
                position: { x: 250, y: 300 },
            }
        ],
        initialEdges: [
            { id: 'e1-2', source: '1', target: '2', animated: true },
            { id: 'e2-3', source: '2', target: '3', animated: true },
        ]
    }
];
