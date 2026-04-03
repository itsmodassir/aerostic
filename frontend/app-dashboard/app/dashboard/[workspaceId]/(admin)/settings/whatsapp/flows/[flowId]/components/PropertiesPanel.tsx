import { useState } from "react";
import { WhatsAppFlowNode, FlowComponent, ScreenNodeData } from "./types";
import { 
    X, Trash2, Plus, GripVertical, Settings, 
    Type, MessageSquare, List, Calendar, CheckSquare, 
    ChevronDown, ChevronUp, Star, Layout,
    Link as LinkIcon, Phone, Mail, Image as ImageIcon, Film, FileText, MousePointer2
} from "lucide-react";

interface PropertiesPanelProps {
    selectedNode: WhatsAppFlowNode | null;
    onChange: (id: string, data: Partial<ScreenNodeData>) => void;
    onDelete: (id: string) => void;
}

interface ComponentEditorProps {
    component: FlowComponent;
    index: number;
    onUpdate: (patch: Partial<FlowComponent>) => void;
    onRemove: () => void;
}

function ComponentEditor({ component, index, onUpdate, onRemove }: ComponentEditorProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getIcon = () => {
        switch (component.type) {
            case 'TextBody': case 'TextHeading': case 'TextSubheading': return <Type size={14} />;
            case 'TextInput': return <MessageSquare size={14} />;
            case 'RadioButtonsGroup': return <List size={14} />;
            case 'DatePicker': return <Calendar size={14} />;
            case 'CheckboxGroup': return <CheckSquare size={14} />;
            case 'Link': return <LinkIcon size={14} />;
            case 'Call': return <Phone size={14} />;
            case 'Email': return <Mail size={14} />;
            case 'Image': return <ImageIcon size={14} />;
            case 'Video': return <Film size={14} />;
            case 'Document': return <FileText size={14} />;
            case 'Footer': return <MousePointer2 size={14} />;
            default: return <Layout size={14} />;
        }
    };

    return (
        <div className="group bg-white border border-slate-100 rounded-xl overflow-hidden hover:border-blue-200 transition-all shadow-sm">
            <div className="p-3 flex items-center gap-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="text-slate-300 hover:text-slate-500 transition-colors">
                    <GripVertical size={14} />
                </div>
                <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{component.label || component.text || component.type}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{component.type}</p>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                    >
                        <Trash2 size={12} />
                    </button>
                    <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="p-3 border-t border-slate-50 bg-slate-50/30 space-y-3">
                    {/* Basic Label/Text */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                            {component.type.includes('Text') ? 'Content' : 'Label'}
                        </label>
                        <input 
                            type="text" 
                            value={component.type.includes('Text') ? (component.text || '') : (component.label || '')} 
                            onChange={(e) => onUpdate({ [component.type.includes('Text') ? 'text' : 'label']: e.target.value })}
                            className="w-full px-2 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-700 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Specialized Fields */}
                    {component.type === 'Link' && (
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">URL (https://...)</label>
                            <input 
                                type="text" 
                                value={component.url || ''} 
                                onChange={(e) => onUpdate({ url: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-700 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    )}

                    {component.type === 'Call' && (
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                            <input 
                                type="text" 
                                value={component.phoneNumber || ''} 
                                onChange={(e) => onUpdate({ phoneNumber: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-700 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    )}

                    {component.type === 'Email' && (
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                            <input 
                                type="text" 
                                value={component.emailAddress || ''} 
                                onChange={(e) => onUpdate({ emailAddress: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-700 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    )}

                    {(component.type === 'Image' || component.type === 'Video' || component.type === 'Document') && (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Source URL</label>
                                <input 
                                    type="text" 
                                    value={component.src || ''} 
                                    onChange={(e) => onUpdate({ src: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-700 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            {component.type === 'Document' && (
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">File Name</label>
                                    <input 
                                        type="text" 
                                        value={component.fileName || ''} 
                                        onChange={(e) => onUpdate({ fileName: e.target.value })}
                                        className="w-full px-2 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-700 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Shared Properties */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <input 
                            type="checkbox" 
                            id={`required-${index}`}
                            checked={!!component.required} 
                            onChange={(e) => onUpdate({ required: e.target.checked })}
                            className="rounded border-slate-200 text-blue-600 focus:ring-blue-500 h-3 w-3"
                        />
                        <label htmlFor={`required-${index}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Required Field</label>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PropertiesPanel({ selectedNode, onChange, onDelete }: PropertiesPanelProps) {
    if (!selectedNode) {
        return (
            <aside className="flex-1 bg-white flex flex-col items-center justify-center p-8 text-center h-full shrink-0">
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
        <aside className="flex-1 bg-white flex flex-col h-full overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Settings size={16} />
                    </div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Properties</h2>
                </div>
                <button 
                    onClick={() => onDelete(id)}
                    className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-100"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                {/* Screen Configuration */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Configuration</h3>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Screen ID</label>
                            <input 
                                type="text" 
                                value={data.id} 
                                onChange={(e) => updateId(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Header Title</label>
                            <input 
                                type="text" 
                                value={data.title} 
                                onChange={(e) => updateTitle(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Layout Components */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Layout Components</h3>
                        <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded-full font-bold text-slate-400 border border-slate-100">{data.components.length}</span>
                    </div>

                    <div className="space-y-3">
                        {data.components.map((comp: FlowComponent, i: number) => (
                            <ComponentEditor 
                                key={i}
                                index={i}
                                component={comp}
                                onUpdate={(patch) => updateComponent(i, patch)}
                                onRemove={() => removeComponent(i)}
                            />
                        ))}

                        {data.components.length === 0 && (
                            <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center px-4 space-y-2">
                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                    <Plus size={20} />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Drag and drop components <br /> here to start</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}

