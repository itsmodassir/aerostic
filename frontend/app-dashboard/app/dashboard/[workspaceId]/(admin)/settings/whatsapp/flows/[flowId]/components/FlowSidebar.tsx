import { 
    Layout, Type, MessageSquare, List, Calendar, 
    CheckSquare, Star, Info, MousePointer2,
    Link as LinkIcon, Phone, Mail, Image as ImageIcon, Film, FileText
} from "lucide-react";

export default function FlowSidebar() {
    const categories = [
        {
            title: 'SCREENS',
            items: [
                { type: 'Screen', label: 'Welcome Screen', icon: Layout, desc: 'Starting message with greeting' },
            ]
        },
        {
            title: 'INPUTS',
            items: [
                { type: 'TextInput', label: 'Text Input', icon: MessageSquare, desc: 'Ask user for text (name, email, etc.)' },
                { type: 'RadioButtonsGroup', label: 'Button List', icon: List, desc: 'Show clickable button options' },
                { type: 'DatePicker', label: 'Date Picker', icon: Calendar, desc: 'Let user pick a date/time' },
                { type: 'CheckboxGroup', label: 'Opt-in Checkbox', icon: CheckSquare, desc: 'Consent / terms agreement' },
                { type: 'Rating', label: 'Rating', icon: Star, desc: 'Star rating or NPS score' },
            ]
        },
        {
            title: 'ACTIONS',
            items: [
                { type: 'Link', label: 'Website Link', icon: LinkIcon, desc: 'Open a URL in browser' },
                { type: 'Call', label: 'Call Node', icon: Phone, desc: 'Initiate a phone call' },
                { type: 'Email', label: 'Email Node', icon: Mail, desc: 'Send an email message' },
            ]
        },
        {
            title: 'MEDIA',
            items: [
                { type: 'Image', label: 'Photo Node', icon: ImageIcon, desc: 'Display an image/photo' },
                { type: 'Video', label: 'Video Node', icon: Film, desc: 'Play a video clip' },
                { type: 'Document', label: 'Docs Node', icon: FileText, desc: 'Share a PDF or document' },
            ]
        }
    ];

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-80 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Components</h2>
                <p className="text-[10px] text-slate-400 font-medium">Drag onto canvas to add</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                {categories.map((cat, i) => (
                    <div key={i} className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.title}</h3>
                        <div className="space-y-3">
                            {cat.items.map((item, j) => (
                                <div
                                    key={j}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, item.type)}
                                    className="group flex items-start gap-4 p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all cursor-grab active:cursor-grabbing"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shrink-0">
                                        <item.icon size={18} className="text-slate-400 group-hover:text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.label}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed truncate">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Info size={14} className="text-blue-600" />
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-normal">
                    Need help building flows? <br />
                    Check our <span className="text-blue-600 font-bold hover:underline cursor-pointer">Flow API Docs</span>
                </p>
            </div>
        </aside>
    );
}
