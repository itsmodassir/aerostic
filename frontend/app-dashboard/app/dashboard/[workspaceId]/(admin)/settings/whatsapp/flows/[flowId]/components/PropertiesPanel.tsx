import { useState } from "react";
import { WhatsAppFlowNode, FlowComponent, ScreenNodeData } from "./types";
import { 
    X, Trash2, Plus, GripVertical, Settings, 
    Type, MessageSquare, List, Calendar, CheckSquare, 
    ChevronDown, ChevronUp, Star, Layout
} from "lucide-react";

interface PropertiesPanelProps {
    selectedNode: WhatsAppFlowNode | null;
    onChange: (id: string, data: Partial<ScreenNodeData>) => void;
    onDelete: (id: string) => void;
}

export default function PropertiesPanel({ selectedNode, onChange, onDelete }: PropertiesPanelProps) {
    if (!selectedNode) {
        return (
            <aside className="w-80 border-l border-slate-200 bg-white flex flex-col items-center justify-center p-8 text-center h-full shrink-0">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <MousePointer2 size={32} className="text-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Editor</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Select a screen on the canvas to edit its properties and layout
                </p>
            </aside>
        );
    }

    const { id, data } = selectedNode;

    const updateTitle = (val: string) => onChange(id, { ...data, title: val });
    const updateId = (val: string) => onChange(id, { ...data, id: val });

    const updateComponent = (index: number, patch: Partial<FlowComponent>) => {
        const components = [...data.components];
        components[index] = { ...components[index], ...patch };
        onChange(id, { ...data, components });
    };

    const removeComponent = (index: number) => {
        const components = [...data.components];
        components.splice(index, 1);
        onChange(id, { ...data, components });
    };

    return (
        <aside className="w-80 border-l border-slate-200 bg-white flex flex-col h-full overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Settings size={14} className="text-slate-400" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Properties</h2>
                </div>
                <button 
                    onClick={() => onDelete(id)}
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors shadow-sm"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Screen ID</label>
                        <input 
                            type="text" 
                            value={data.id} 
                            onChange={(e) => updateId(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Screen Title</label>
                        <input 
                            type="text" 
                            value={data.title} 
                            onChange={(e) => updateTitle(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Layout Components</label>
                        <button className="p-1 px-2.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-100 hover:border-blue-100 transition-all shadow-sm">
                            <Plus size={12} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {data.components.map((comp, i) => (
                            <div key={i} className="group bg-white border border-slate-100 rounded-xl overflow-hidden hover:border-blue-200 transition-all shadow-sm">
                                <div className="p-3 flex items-center gap-3">
                                    <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors">
                                        <GripVertical size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            value={comp.label || comp.text || comp.type} 
                                            onChange={(e) => updateComponent(i, { [comp.type.includes('Text') ? 'text' : 'label']: e.target.value })}
                                            className="w-full border-none p-0 text-xs font-bold text-slate-700 focus:ring-0 outline-none"
                                        />
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{comp.type}</p>
                                    </div>
                                    <button 
                                        onClick={() => removeComponent(i)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}

function MousePointer2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            <path d="m13 13 6 6" />
        </svg>
    );
}
