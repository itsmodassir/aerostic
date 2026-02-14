import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Globe } from 'lucide-react';

const ApiNode = ({ data, id }: NodeProps) => {
    return (
        <div className="bg-white border-2 border-cyan-500 rounded-xl shadow-lg min-w-[300px] overflow-hidden">
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-cyan-500" />
            <div className="bg-cyan-500 p-2 flex items-center gap-2 text-white">
                <Globe size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">HTTP Request</span>
            </div>
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${data.method === 'GET' ? 'bg-blue-500' :
                            data.method === 'POST' ? 'bg-green-500' :
                                data.method === 'PUT' ? 'bg-orange-500' :
                                    'bg-red-500'
                        }`}>
                        {data.method || 'GET'}
                    </span>
                    <span className="text-xs font-mono truncate max-w-[200px]" title={data.url as string}>
                        {data.url || 'https://api.example.com'}
                    </span>
                </div>
                <p className="text-[10px] text-gray-500">
                    Response data available in <code>{`context.${data.variableName || 'apiResponse'}`}</code>
                </p>
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-cyan-500" />
        </div>
    );
};

export default memo(ApiNode);
