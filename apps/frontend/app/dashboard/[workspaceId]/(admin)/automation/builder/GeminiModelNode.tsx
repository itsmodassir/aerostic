import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node as WorkflowUIFlowNode } from '@xyflow/react';
import { Sparkles } from 'lucide-react';
import { GeminiModelNodeData } from '@/types/workflow';

const GeminiModelNode = ({ data, id }: NodeProps<WorkflowUIFlowNode<GeminiModelNodeData>>) => {
    return (
        <div className="bg-white border-2 border-blue-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
            <div className="bg-blue-500 p-2 flex items-center gap-2 text-white">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Gemini Model</span>
            </div>

            <div className="p-3 space-y-1">
                <div className="text-xs font-bold text-gray-700">{data.model || 'gemini-1.5-pro'}</div>
                <div className="text-[10px] text-gray-500">Temp: {data.temperature ?? 0.7}</div>
            </div>

            {/* Output to Agent */}
            <Handle type="source" position={Position.Right} id="model-source" className="w-3 h-3 bg-blue-500" />
        </div>
    );
};

export default memo(GeminiModelNode);
