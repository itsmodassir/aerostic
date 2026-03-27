import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node as WorkflowUIFlowNode } from '@xyflow/react';
import { FileText } from 'lucide-react';

const WaFormNode = ({ data, selected }: NodeProps<WorkflowUIFlowNode>) => {
    return (
        <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[250px] overflow-hidden transition-all duration-200 ${selected ? 'border-orange-500 ring-2 ring-orange-100' : 'border-orange-200 hover:border-orange-300'}`}>
            <div className="bg-orange-50 p-3 flex items-center gap-3 border-b border-orange-100">
                <div className="p-2 bg-white rounded-lg shadow-sm text-orange-600">
                    <FileText size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">WA Form</h3>
                    <p className="text-[10px] text-orange-600 font-medium">Send Published Form</p>
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 border border-gray-100">
                    {data.formId || data.metaFlowId ? (
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-gray-700">{(data.formName as string) || 'Selected Form'}</span>
                            <span className="truncate opacity-75 font-mono">{(data.metaFlowId as string) || (data.formId as string)}</span>
                        </div>
                    ) : (
                        <span>Select a published WA form...</span>
                    )}
                </div>
            </div>

            <Handle type="target" position={Position.Left} className="!bg-orange-400 !w-3 !h-3 !-left-1.5" />
            <Handle type="source" position={Position.Right} className="!bg-orange-400 !w-3 !h-3 !-right-1.5" />
        </div>
    );
};

export default memo(WaFormNode);

