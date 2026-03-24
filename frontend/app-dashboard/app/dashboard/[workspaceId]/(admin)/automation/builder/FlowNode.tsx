import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node as WorkflowUIFlowNode } from '@xyflow/react';
import { Zap } from 'lucide-react';

const FlowNode = ({ data, selected }: NodeProps<WorkflowUIFlowNode>) => {
    return (
        <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[250px] overflow-hidden transition-all duration-200 ${selected ? 'border-pink-500 ring-2 ring-pink-100' : 'border-pink-200 hover:border-pink-300'}`}>
            {/* Header */}
            <div className="bg-pink-50 p-3 flex items-center gap-3 border-b border-pink-100">
                <div className="p-2 bg-white rounded-lg shadow-sm text-pink-600">
                    <Zap size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">WhatsApp Flow</h3>
                    <p className="text-[10px] text-pink-600 font-medium">Send Interactive Flow</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 border border-gray-100">
                    {data.flowId ? (
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-gray-700">Flow ID:</span>
                            <span className="truncate opacity-75 font-mono">{data.flowId}</span>
                            <span className="text-[10px] bg-pink-50 px-1.5 py-0.5 rounded w-fit text-pink-600 uppercase font-bold mt-1">{data.flowAction || 'NAVIGATE'}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                            <span>Select a Flow...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Handles */}
            <Handle type="target" position={Position.Left} className="!bg-pink-400 !w-3 !h-3 !-left-1.5" />
            <Handle type="source" position={Position.Right} className="!bg-pink-400 !w-3 !h-3 !-right-1.5" />
        </div>
    );
};

export default memo(FlowNode);
