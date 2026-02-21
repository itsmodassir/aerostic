import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node as WorkflowUIFlowNode } from '@xyflow/react';
import { Bot, Wrench, Cpu } from 'lucide-react';
import { AiAgentNodeData } from '@/types/workflow';

const AiAgentNode = ({ data, id }: NodeProps<WorkflowUIFlowNode<AiAgentNodeData>>) => {
    return (
        <div className="bg-white border-2 border-purple-600 rounded-xl shadow-lg min-w-[300px] overflow-hidden">
            {/* Flow Inputs */}
            <Handle type="target" position={Position.Left} id="flow-target" className="w-3 h-3 bg-purple-600 top-1/2" />

            {/* Tool Input - Offset to top */}
            <div className="absolute left-0 top-1/4 -ml-1.5 flex items-center">
                <Handle type="target" position={Position.Left} id="tool-target" className="w-3 h-3 bg-orange-500 !static" />
                <span className="text-[9px] font-bold text-orange-500 ml-1 bg-white px-1 shadow-sm rounded">TOOLS</span>
            </div>

            {/* Model Input - Offset to bottom */}
            <div className="absolute left-0 top-3/4 -ml-1.5 flex items-center">
                <Handle type="target" position={Position.Left} id="model-target" className="w-3 h-3 bg-blue-500 !static" />
                <span className="text-[9px] font-bold text-blue-500 ml-1 bg-white px-1 shadow-sm rounded">MODEL</span>
            </div>

            <div className="bg-purple-600 p-2 flex items-center gap-2 text-white">
                <Bot size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">AI Agent (v2)</span>
            </div>

            <div className="p-4 space-y-2">
                <p className="text-xs text-gray-600 line-clamp-2">
                    {data.systemPrompt || "I am a helpful assistant..."}
                </p>

                <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        <Wrench size={10} />
                        Dynamic Tools
                    </span>
                    <span className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        <Cpu size={10} />
                        Model Config
                    </span>
                </div>
            </div>

            {/* Flow Output */}
            <Handle type="source" position={Position.Right} id="flow-source" className="w-3 h-3 bg-purple-600" />
        </div>
    );
};

export default memo(AiAgentNode);
