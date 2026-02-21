import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node as WorkflowUIFlowNode } from '@xyflow/react';
import { Webhook } from 'lucide-react';
import { TriggerNodeData } from '@/types/workflow';

const WebhookNode = ({ data, id }: NodeProps<WorkflowUIFlowNode<TriggerNodeData>>) => {
    // Construct the webhook URL based on the current environment and workflow ID
    // In a real app, this might come from an env var or context
    const webhookUrl = `https://api.aerostic.com/automation/webhooks/${(data as any).workflowId || 'WORKFLOW_ID'}`;

    return (
        <div className="bg-white border-2 border-pink-500 rounded-xl shadow-lg min-w-[300px] overflow-hidden">
            <div className="bg-pink-500 p-2 flex items-center gap-2 text-white">
                <Webhook size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Webhook Trigger</span>
            </div>
            <div className="p-4">
                <div className="mb-3">
                    <p className="text-[10px] text-gray-500 font-medium mb-1">WEBHOOK URL (POST)</p>
                    <div className="bg-gray-100 p-2 rounded text-[10px] font-mono break-all border select-all cursor-text flex items-center justify-between group">
                        <span>{webhookUrl}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                        Send JSON body to trigger this flow. Data available in <code>webhookPayload</code> context.
                    </p>
                </div>
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-pink-500" />
        </div>
    );
};

export default memo(WebhookNode);
