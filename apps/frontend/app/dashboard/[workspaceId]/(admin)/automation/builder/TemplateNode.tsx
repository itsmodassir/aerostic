import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { LayoutTemplate } from 'lucide-react';

interface TemplateNodeData extends Record<string, unknown> {
    templateName?: string;
    language?: string;
    variables?: string;
}

const TemplateNode = ({ data, selected }: NodeProps<Node<TemplateNodeData>>) => {
    return (
        <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[250px] overflow-hidden transition-all duration-200 ${selected ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-indigo-200 hover:border-indigo-300'}`}>
            {/* Header */}
            <div className="bg-indigo-50 p-3 flex items-center gap-3 border-b border-indigo-100">
                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                    <LayoutTemplate size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">WhatsApp Template</h3>
                    <p className="text-[10px] text-indigo-600 font-medium">Send Approved Template</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 border border-gray-100">
                    {data.templateName ? (
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-gray-700">Template:</span>
                            <span className="truncate opacity-75 font-mono">{data.templateName}</span>
                            <span className="text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded w-fit text-indigo-600 uppercase font-bold mt-1">{data.language || 'en_US'}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                            <span>Select a template...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Handles */}
            <Handle type="target" position={Position.Left} className="!bg-indigo-400 !w-3 !h-3 !-left-1.5" />
            <Handle type="source" position={Position.Right} className="!bg-indigo-400 !w-3 !h-3 !-right-1.5" />
        </div>
    );
};

export default memo(TemplateNode);
