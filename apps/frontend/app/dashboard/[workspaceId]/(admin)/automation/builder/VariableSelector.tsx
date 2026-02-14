'use client';

import React from 'react';
import { Braces, User, Zap, Box, ChevronRight, Globe } from 'lucide-react';
import { WorkflowUIFlowNode } from './page';

interface VariableSelectorProps {
    nodes: WorkflowUIFlowNode[];
    onSelect: (variable: string) => void;
    onClose: () => void;
}

export const VariableSelector: React.FC<VariableSelectorProps> = ({ nodes, onSelect, onClose }) => {
    const categories = [
        {
            name: 'Contact Data',
            icon: <User size={14} className="text-emerald-500" />,
            vars: [
                { label: 'Full Name', path: 'contact.name' },
                { label: 'Phone Number', path: 'contact.phone' },
                { label: 'Email', path: 'contact.email' },
                { label: 'Workspace ID', path: 'workspaceId' },
            ]
        },
        {
            name: 'Trigger Data',
            icon: <Zap size={14} className="text-pink-500" />,
            vars: [
                { label: 'Message Body', path: 'trigger.body' },
                { label: 'Sender Phone', path: 'trigger.from' },
                { label: 'Timestamp', path: 'trigger.timestamp' },
            ]
        },
        {
            name: 'Memory Data',
            icon: <Box size={14} className="text-purple-500" />,
            vars: [
                { label: 'Saved Value', path: 'memory.key' },
            ]
        },
        {
            name: 'Knowledge Base',
            icon: <Globe size={14} className="text-cyan-500" />,
            vars: [
                { label: 'Search Results', path: 'knowledgeOutput.results' },
                { label: 'Combined Result', path: 'knowledgeOutput.joinedResults' },
            ]
        }
    ];

    // Add node outputs
    const nodeVars = nodes
        .filter(n => n.data.variableName || n.data.label || n.id)
        .map(n => ({
            label: n.data.label || n.type,
            path: n.data.variableName ? `${n.data.variableName}` : `nodes.${n.id}.output`
        }));

    return (
        <div className="absolute right-full mr-2 top-0 w-64 bg-white border shadow-2xl rounded-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Braces size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-gray-800">Insert Variable</span>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">Close</button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {categories.map((cat, idx) => (
                    <div key={idx} className="p-2">
                        <div className="px-2 py-1 flex items-center gap-2 mb-1">
                            {cat.icon}
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cat.name}</span>
                        </div>
                        {cat.vars.map((v, vIdx) => (
                            <button
                                key={vIdx}
                                onClick={() => onSelect(`{{${v.path}}}`)}
                                className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-between group"
                            >
                                <span className="text-xs font-semibold text-gray-700">{v.label}</span>
                                <span className="text-[10px] text-gray-400 font-mono group-hover:text-blue-500">{v.path}</span>
                            </button>
                        ))}
                    </div>
                ))}

                {nodeVars.length > 0 && (
                    <div className="p-2 border-t">
                        <div className="px-2 py-1 flex items-center gap-2 mb-1">
                            <Box size={14} className="text-blue-500" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Node Outputs</span>
                        </div>
                        {nodeVars.map((v, vIdx) => (
                            <button
                                key={vIdx}
                                onClick={() => onSelect(`{{${v.path}}}`)}
                                className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-between group"
                            >
                                <span className="text-xs font-semibold text-gray-700">{v.label}</span>
                                <span className="text-[10px] text-gray-400 font-mono group-hover:text-blue-500">{v.path}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 bg-blue-50 border-t">
                <p className="text-[10px] text-blue-600 italic">
                    Tip: Variables are resolved in real-time during execution.
                </p>
            </div>
        </div>
    );
};
