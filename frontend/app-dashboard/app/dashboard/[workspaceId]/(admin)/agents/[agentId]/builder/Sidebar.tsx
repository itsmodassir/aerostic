import React from 'react';
import { 
    MessageSquare, Zap, Split, FileText, 
    ArrowRight, Sparkles, Layers, Info, 
    ChevronRight, Database, Bot
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export default function Sidebar() {
    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-80 h-full bg-white border-l-2 border-slate-50 flex flex-col p-8 overflow-y-auto">
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                     <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                     <h3 className="text-xl font-black text-slate-900 tracking-tight lowercase">Warehouse<span className="text-indigo-600">_</span></h3>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    Deploy intelligence nodes and define the logic flow of your AI agents.
                </p>
            </div>

            <div className="space-y-6">
                {[
                    { type: 'MessageNode', title: 'Payload Response', desc: 'Direct text interaction', icon: MessageSquare, color: 'blue' },
                    { type: 'TemplateNode', title: 'Vector Pattern', desc: 'Marketing/Utility template', icon: FileText, color: 'purple' },
                    { type: 'ConditionNode', title: 'Binary Switch', desc: 'If / Else logical branching', icon: Split, color: 'rose' },
                ].map((item, idx) => (
                    <motion.div
                        key={item.type}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div
                            className={clsx(
                                "relative p-6 rounded-[28px] border-2 cursor-grab active:cursor-grabbing hover:shadow-2xl transition-all group overflow-hidden",
                                item.color === 'blue' ? 'bg-blue-50/10 border-blue-50/50 hover:border-blue-200' :
                                item.color === 'purple' ? 'bg-purple-50/10 border-purple-50/50 hover:border-purple-200' :
                                'bg-rose-50/10 border-rose-50/50 hover:border-rose-200'
                            )}
                            onDragStart={(event) => onDragStart(event, item.type)}
                            draggable
                        >
                         <div className={clsx(
                             "absolute -right-4 -bottom-4 w-24 h-24 blur-[40px] opacity-10 group-hover:opacity-30 transition-opacity",
                             `bg-${item.color}-500`
                         )} />
                         
                         <div className="flex items-start justify-between relative mb-6">
                             <div className={clsx(
                                 "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                 item.color === 'blue' ? 'bg-blue-600 text-white shadow-blue-100' :
                                 item.color === 'purple' ? 'bg-purple-600 text-white shadow-purple-100' :
                                 'bg-rose-600 text-white shadow-rose-100'
                             )}>
                                 <item.icon size={22} strokeWidth={2.5} />
                             </div>
                             <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                         </div>

                         <h4 className="text-sm font-black text-slate-900 tracking-tight group-hover:text-slate-700 mb-1.5 lowercase italic transition-colors">{item.title}</h4>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60 italic">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-auto pt-10 space-y-6">
                <div className="p-6 bg-slate-50/50 rounded-[32px] border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                         <Info size={14} className="text-indigo-500" />
                         <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Protocol Instructions</span>
                    </div>
                    <ul className="space-y-3">
                        {['Node Drag', 'Vector Link', 'Attribute Sync', 'Cloud Deploy'].map((inst, i) => (
                            <li key={i} className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                {inst.replace('_', ' ')}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-[20px] border border-indigo-100/50">
                     <Bot className="text-indigo-600" size={16} />
                     <div className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] leading-tight">
                          Agent AI is currently active in High Performance mode
                     </div>
                </div>
            </div>
        </aside>
    );
}
