import React, { memo, ReactNode, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { MessageSquare, Zap, Split, FileText, LucideIcon } from 'lucide-react';

interface NodeWrapperProps {
    children: ReactNode;
    title: string;
    icon: LucideIcon;
    color: string;
}

const NodeWrapper = ({ children, title, icon: Icon, color }: NodeWrapperProps) => (
    <div className={`min-w-[250px] bg-white rounded-lg shadow-md border-2 ${color} overflow-hidden`}>
        <div className={`px-4 py-2 flex items-center gap-2 ${color.replace('border-', 'bg-').replace('-500', '-50')} border-b`}>
            <Icon size={16} className={color.replace('border-', 'text-')} />
            <span className="font-semibold text-sm text-gray-700">{title}</span>
        </div>
        <div className="p-4">
            {children}
        </div>
    </div>
);

export const TriggerNode = memo(({ data }: NodeProps) => {
    return (
        <NodeWrapper title="Trigger" icon={Zap} color="border-yellow-500">
            <div className="text-xs text-gray-500 mb-2">Starts the flow when:</div>
            <div className="font-medium text-sm">{String(data.label || 'Incoming Message')}</div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-500" />
        </NodeWrapper>
    );
});

export const MessageNode = memo(({ id, data }: NodeProps) => {
    const { updateNodeData } = useReactFlow();

    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateNodeData(id, { text: evt.target.value });
    }, [id, updateNodeData]);

    return (
        <NodeWrapper title="Send Message" icon={MessageSquare} color="border-blue-500">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
            <div className="text-xs text-gray-500 mb-2">Message text:</div>
            <textarea
                className="text-sm bg-gray-50 p-2 rounded border border-gray-200 w-full min-h-[60px] resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 nodrag cursor-text"
                value={String(data.text || '')}
                onChange={onChange}
                placeholder="Enter message..."
            />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
        </NodeWrapper>
    );
});

export const TemplateNode = memo(({ id, data }: NodeProps) => {
    const { updateNodeData } = useReactFlow();

    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { templateName: evt.target.value });
    }, [id, updateNodeData]);

    return (
        <NodeWrapper title="Send Template" icon={FileText} color="border-purple-500">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
            <div className="text-xs text-gray-500 mb-2">Template to send:</div>
            <input
                className="w-full text-sm font-medium text-purple-700 bg-purple-50 p-2 rounded border border-purple-200 focus:outline-none focus:ring-1 focus:ring-purple-500 nodrag cursor-text"
                value={String(data.templateName || '')}
                onChange={onChange}
                placeholder="Enter template name..."
            />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500" />
        </NodeWrapper>
    );
});

export const ConditionNode = memo(({ id, data }: NodeProps) => {
    const { updateNodeData } = useReactFlow();

    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { condition: evt.target.value });
    }, [id, updateNodeData]);

    return (
        <div className="min-w-[200px] bg-white rounded-lg shadow-md border-2 border-orange-500 overflow-hidden">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500" />
            <div className="px-4 py-2 flex items-center gap-2 bg-orange-50 border-b border-orange-100">
                <Split size={16} className="text-orange-500" />
                <span className="font-semibold text-sm text-gray-700">Condition</span>
            </div>
            <div className="p-4 relative pb-10">
                <input
                    className="w-full text-sm text-center font-medium mb-2 bg-gray-50 p-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 nodrag cursor-text"
                    value={String(data.condition || '')}
                    onChange={onChange}
                    placeholder="e.g. user says 'buy'"
                />

                <div className="absolute bottom-4 left-4 text-xs font-bold text-green-600">YES</div>
                <div className="absolute bottom-4 right-4 text-xs font-bold text-red-600">NO</div>

                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="true"
                    style={{ left: '25%' }}
                    className="w-3 h-3 bg-green-500"
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="false"
                    style={{ left: '75%' }}
                    className="w-3 h-3 bg-red-500"
                />
            </div>
        </div>
    );
});
