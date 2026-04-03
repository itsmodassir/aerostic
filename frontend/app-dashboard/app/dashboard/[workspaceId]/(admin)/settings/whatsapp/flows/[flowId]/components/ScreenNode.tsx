import { Handle, Position } from "@xyflow/react";
import { FlowComponent, ScreenNodeData } from "./types";
import { 
    MessageSquare, Type, List, Calendar, CheckSquare, 
    Star, Layout, MoreHorizontal, MousePointer2, 
    Link as LinkIcon, Phone, Mail, Image as ImageIcon, Film, FileText 
} from "lucide-react";

const ComponentIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'TextBody': return <Type size={12} className="text-slate-400" />;
        case 'TextInput': return <MessageSquare size={12} className="text-slate-400" />;
        case 'RadioButtonsGroup': return <List size={12} className="text-slate-400" />;
        case 'DatePicker': return <Calendar size={12} className="text-slate-400" />;
        case 'CheckboxGroup': return <CheckSquare size={12} className="text-slate-400" />;
        case 'Footer': return <MousePointer2 size={12} className="text-slate-400" />;
        case 'Link': return <LinkIcon size={12} className="text-slate-400" />;
        case 'Call': return <Phone size={12} className="text-slate-400" />;
        case 'Email': return <Mail size={12} className="text-slate-400" />;
        case 'Image': return <ImageIcon size={12} className="text-slate-400" />;
        case 'Video': return <Film size={12} className="text-slate-400" />;
        case 'Document': return <FileText size={12} className="text-slate-400" />;
        default: return <Layout size={12} className="text-slate-400" />;
    }
};

export default function ScreenNode({ data, selected }: { data: ScreenNodeData; selected: boolean }) {
    // Determine header color based on ID or content
    const getHeaderColor = () => {
        if (data.id === 'WELCOME') return 'bg-teal-500';
        if (data.id.toLowerCase().includes('success')) return 'bg-blue-500';
        return 'bg-indigo-500';
    };

    return (
        <div className={`w-64 bg-white rounded-xl shadow-lg border-2 transition-all ${selected ? 'border-blue-500 ring-4 ring-blue-50/50' : 'border-transparent'}`}>
            <div className={`h-8 rounded-t-[10px] ${getHeaderColor()} flex items-center px-3 justify-between`}>
                <div className="flex items-center gap-2">
                    <Layout size={14} className="text-white/80" />
                    <span className="text-xs font-bold text-white truncate max-w-[140px] uppercase tracking-wider">{data.title || data.id}</span>
                </div>
                <MoreHorizontal size={14} className="text-white/60" />
            </div>

            <div className="p-3 space-y-2">
                {data.components.length > 0 ? (
                    data.components.slice(0, 3).map((comp, i) => (
                        <div key={i} className="flex items-center gap-2 py-1.5 px-2 bg-slate-50 rounded-lg border border-slate-100">
                            <ComponentIcon type={comp.type} />
                            <span className="text-[10px] text-slate-600 font-medium truncate">
                                {comp.label || comp.text || comp.type}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="py-4 text-center">
                        <p className="text-[10px] text-slate-400 font-medium italic">Empty screen • Add data</p>
                    </div>
                )}
                {data.components.length > 3 && (
                    <div className="text-[10px] text-slate-400 text-center font-bold">
                        + {data.components.length - 3} more
                    </div>
                )}
            </div>

            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 bg-white border-2 border-slate-300"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 bg-white border-2 border-slate-300"
            />
        </div>
    );
}
