import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileSpreadsheet } from 'lucide-react';

const GoogleSheetsNode = ({ data, selected }: NodeProps) => {
    return (
        <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[250px] overflow-hidden transition-all duration-200 ${selected ? 'border-green-500 ring-2 ring-green-100' : 'border-green-200 hover:border-green-300'}`}>
            {/* Header */}
            <div className="bg-green-50 p-3 flex items-center gap-3 border-b border-green-100">
                <div className="p-2 bg-white rounded-lg shadow-sm text-green-600">
                    <FileSpreadsheet size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">Google Sheets</h3>
                    <p className="text-[10px] text-green-600 font-medium">Read / Write Data</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-500 border border-gray-100">
                    {data.sheetId ? (
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-gray-700">Sheet Connected</span>
                            <span className="truncate opacity-75">{data.sheetName || 'Untitled Sheet'}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                            <span>No sheet connected</span>
                        </div>
                    )}
                </div>

                {data.operation && (
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <span className="bg-gray-100 px-2 py-1 rounded">{data.operation}</span>
                    </div>
                )}
            </div>

            {/* Handles */}
            <Handle type="target" position={Position.Left} className="!bg-green-400 !w-3 !h-3 !-left-1.5" />
            <Handle type="source" position={Position.Right} className="!bg-green-400 !w-3 !h-3 !-right-1.5" />
        </div>
    );
};

export default memo(GoogleSheetsNode);
