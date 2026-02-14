import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node as WorkflowUIFlowNode } from '@xyflow/react';
import { HardDrive } from 'lucide-react';
import { GoogleDriveNodeData } from '@/types/workflow';

const GoogleDriveNode = ({ data, id }: NodeProps<WorkflowUIFlowNode<GoogleDriveNodeData>>) => {
    return (
        <div className="bg-white border-2 border-green-600 rounded-xl shadow-lg min-w-[300px] overflow-hidden">
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-600" />
            <div className="bg-green-600 p-2 flex items-center gap-2 text-white">
                <HardDrive size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Google Drive</span>
            </div>
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${data.operation === 'upload' ? 'bg-blue-500' :
                        data.operation === 'download' ? 'bg-orange-500' :
                            'bg-gray-500'
                        }`}>
                        {data.operation ? (data.operation as string).toUpperCase() : 'OPERATION'}
                    </span>
                </div>
                {data.operation === 'upload' && (
                    <p className="text-xs text-gray-700">
                        Uploading <strong>{data.fileName as string || 'file'}</strong>
                    </p>
                )}
                {data.operation === 'download' && (
                    <p className="text-xs text-gray-700">
                        Downloading <strong>{data.fileName || 'file'}</strong>
                    </p>
                )}
                {data.operation === 'list' && (
                    <p className="text-xs text-gray-700">
                        Listing files
                    </p>
                )}
                <p className="text-[10px] text-gray-500 mt-2">
                    Result available in <code>{`context.${data.variableName || 'driveResult'}`}</code>
                </p>
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-600" />
        </div>
    );
};

export default memo(GoogleDriveNode);
