import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node as WorkflowUIFlowNode } from '@xyflow/react';
import { User, UserPlus, Search } from 'lucide-react';
import { ContactNodeData } from '@/types/workflow';

const ContactNode = ({ data, selected }: NodeProps<WorkflowUIFlowNode<ContactNodeData>>) => {
    const getIcon = () => {
        switch (data.operation) {
            case 'create': return <UserPlus size={18} />;
            case 'get': return <Search size={18} />;
            default: return <User size={18} />;
        }
    };

    const getLabel = () => {
        switch (data.operation) {
            case 'create': return 'Create Contact';
            case 'update': return 'Update Contact';
            case 'get': return 'Get Contact';
            default: return 'Contact';
        }
    };

    return (
        <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[250px] overflow-hidden transition-all duration-200 ${selected ? 'border-purple-500 ring-2 ring-purple-100' : 'border-purple-200 hover:border-purple-300'}`}>
            {/* Header */}
            <div className="bg-purple-50 p-3 flex items-center gap-3 border-b border-purple-100">
                <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600">
                    {getIcon()}
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">{getLabel()}</h3>
                    <p className="text-[10px] text-purple-600 font-medium">CRM Operation</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-500 border border-gray-100">
                    {data.operation ? (
                        <div className="flex flex-col gap-1">
                            {data.operation !== 'create' && (
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Match By:</span>
                                    <span>{data.matchField || 'Phone'}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-700">Action:</span>
                                <span className="uppercase">{data.operation}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                            <span>Configure operation...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Handles */}
            <Handle type="target" position={Position.Left} className="!bg-purple-400 !w-3 !h-3 !-left-1.5" />
            <Handle type="source" position={Position.Right} className="!bg-purple-400 !w-3 !h-3 !-right-1.5" />
        </div>
    );
};

export default memo(ContactNode);
