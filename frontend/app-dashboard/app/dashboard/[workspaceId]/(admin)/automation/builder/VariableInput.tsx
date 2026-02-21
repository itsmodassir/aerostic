'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Braces, User, Zap, Box, Globe } from 'lucide-react';
import { WorkflowUIFlowNode } from './page';

interface VariableInputProps {
    value: string;
    onChange: (value: string) => void;
    nodes: WorkflowUIFlowNode[];
    placeholder?: string;
    textarea?: boolean;
    className?: string;
}

export const VariableInput: React.FC<VariableInputProps> = ({ value, onChange, nodes, placeholder, textarea, className }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [search, setSearch] = useState('');
    const [cursorPos, setCursorPos] = useState(0);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    const categories = [
        {
            name: 'Contact Data',
            icon: <User size={12} className="text-emerald-500" />,
            vars: [
                { label: 'Full Name', path: 'contact.name' },
                { label: 'Phone Number', path: 'contact.phone' },
                { label: 'Email', path: 'contact.email' },
            ]
        },
        {
            name: 'Trigger Data',
            icon: <Zap size={12} className="text-pink-500" />,
            vars: [
                { label: 'Message Body', path: 'trigger.body' },
                { label: 'Sender Phone', path: 'trigger.from' },
            ]
        },
        {
            name: 'Node Outputs',
            icon: <Box size={12} className="text-blue-500" />,
            vars: nodes
                .filter(n => n.data.variableName)
                .map(n => ({
                    label: n.data.label || n.type,
                    path: n.data.variableName
                }))
        }
    ];

    const allVars = categories.flatMap(c => c.vars);
    const filteredVars = allVars.filter(v =>
        v.label.toLowerCase().includes(search.toLowerCase()) ||
        v.path.toLowerCase().includes(search.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const position = e.target.selectionStart || 0;
        setCursorPos(position);
        onChange(newValue);

        const textBeforeCursor = newValue.slice(0, position);
        const match = textBeforeCursor.match(/\{\{([^{}]*)$/);

        if (match) {
            setShowSuggestions(true);
            setSearch(match[1]);
        } else {
            setShowSuggestions(false);
        }
    };

    const insertVariable = (variablePath: string) => {
        const textBefore = value.slice(0, cursorPos).replace(/\{\{[^{}]*$/, '');
        const textAfter = value.slice(cursorPos);
        const finalValue = `${textBefore}{{${variablePath}}}${textAfter}`;
        onChange(finalValue);
        setShowSuggestions(false);

        // Return focus
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                const newPos = textBefore.length + variablePath.length + 4;
                inputRef.current.setSelectionRange(newPos, newPos);
            }
        }, 0);
    };

    return (
        <div className="relative w-full">
            {textarea ? (
                <textarea
                    ref={inputRef as any}
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className={className}
                />
            ) : (
                <input
                    ref={inputRef as any}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className={className}
                />
            )}

            {showSuggestions && (
                <div className="absolute z-[100] mt-1 w-64 bg-white border shadow-2xl rounded-xl overflow-hidden max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Braces size={14} className="text-blue-600" />
                            <span className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">Variables</span>
                        </div>
                    </div>
                    {filteredVars.length > 0 ? (
                        <div className="p-1">
                            {filteredVars.map((v, i) => (
                                <button
                                    key={i}
                                    onClick={() => insertVariable(v.path)}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex flex-col group"
                                >
                                    <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-700">{v.label}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">{`{{${v.path}}}`}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-xs text-gray-400 italic">No variables found</div>
                    )}
                </div>
            )}
        </div>
    );
};
