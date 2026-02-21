import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node as WorkflowUIFlowNode } from '@xyflow/react';
import { Cpu } from 'lucide-react';
import { OpenAIModelNodeData } from '@/types/workflow';

const OpenAiModelNode = ({ data, id }: NodeProps<WorkflowUIFlowNode<OpenAIModelNodeData>>) => {
    return (
        <div className="bg-white border-2 border-teal-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
            <div className="bg-teal-500 p-2 flex items-center gap-2 text-white">
                <Cpu size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">OpenAI Model</span>
            </div>

            <div className="p-3 space-y-1">
                <div className="text-xs font-bold text-gray-700">{data.model || 'gpt-4o'}</div>
                <div className="text-[10px] text-gray-500">Temp: {data.temperature ?? 0.7}</div>
            </div>

            {/* Output to Agent */}
            <Handle type="source" position={Position.Right} id="model-source" className="w-3 h-3 bg-teal-500" />
        </div>
    );
};

export default memo(OpenAiModelNode);
