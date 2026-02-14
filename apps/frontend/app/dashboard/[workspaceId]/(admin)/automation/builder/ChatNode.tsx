import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageSquare, UserCheck } from 'lucide-react';

const ChatNode = ({ data }: NodeProps) => {
    return (
        <div className="bg-white border-2 border-indigo-500 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500" />
            <div className="bg-indigo-500 p-2 flex items-center gap-2 text-white">
                <MessageSquare size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Agent Handoff</span>
            </div>
            <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <UserCheck size={20} className="text-indigo-600" />
                    </div>
                </div>
                <h4 className="font-bold text-gray-900">Transfer to Human</h4>
                <p className="text-[10px] text-gray-500 mt-1">Stops automation & notifies agents</p>
            </div>
            {/* No source handle because this is a terminal node usually, 
                or maybe valid if we want to log something after? 
                Let's keep it terminal for now as it stops the "bot" */}
        </div>
    );
};

export default memo(ChatNode);
