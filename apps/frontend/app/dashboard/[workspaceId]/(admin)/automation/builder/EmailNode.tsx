import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Mail } from 'lucide-react';

interface EmailNodeData extends Record<string, unknown> {
    to?: string;
    subject?: string;
    body?: string;
    provider?: 'smtp' | 'resend' | 'sendgrid';
}

const EmailNode = ({ data, selected }: NodeProps<Node<EmailNodeData>>) => {
    return (
        <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[250px] overflow-hidden transition-all duration-200 ${selected ? 'border-sky-500 ring-2 ring-sky-100' : 'border-sky-200 hover:border-sky-300'}`}>
            {/* Header */}
            <div className="bg-sky-50 p-3 flex items-center gap-3 border-b border-sky-100">
                <div className="p-2 bg-white rounded-lg shadow-sm text-sky-600">
                    <Mail size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">Send Email</h3>
                    <p className="text-[10px] text-sky-600 font-medium">{data.provider ? data.provider.toUpperCase() : 'SMTP'}</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 border border-gray-100 space-y-2">
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-700">To:</span>
                        <span className="truncate opacity-75">{data.to || '{{contact.email}}'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-700">Subject:</span>
                        <span className="truncate opacity-75 italic">{data.subject || '(No Subject)'}</span>
                    </div>
                </div>
            </div>

            {/* Handles */}
            <Handle type="target" position={Position.Left} className="!bg-sky-400 !w-3 !h-3 !-left-1.5" />
            <Handle type="source" position={Position.Right} className="!bg-sky-400 !w-3 !h-3 !-right-1.5" />
        </div>
    );
};

export default memo(EmailNode);
