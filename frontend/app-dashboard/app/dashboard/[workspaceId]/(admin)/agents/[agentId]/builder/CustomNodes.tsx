import React, { memo, ReactNode, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { 
    MessageSquare, Zap, Split, FileText, LucideIcon, 
    ArrowDown, CheckCircle2, AlertCircle, Bot, Sparkles, Activity
} from 'lucide-react';
import { clsx } from 'clsx';

interface NodeWrapperProps {
    children: ReactNode;
    title: string;
    icon: LucideIcon;
    color: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
    active?: boolean;
}

const NodeWrapper = ({ children, title, icon: Icon, color, active = true }: NodeWrapperProps) => (
    <div className={clsx(
        "min-w-[280px] bg-white rounded-[32px] shadow-2xl border-2 overflow-hidden transition-all duration-500 group",
        color === 'emerald' ? 'border-emerald-50 shadow-emerald-500/5' :
        color === 'blue' ? 'border-blue-50 shadow-blue-500/5' :
        color === 'purple' ? 'border-purple-50 shadow-purple-500/5' :
        color === 'amber' ? 'border-amber-50 shadow-amber-500/5' : 'border-rose-50 shadow-rose-500/5'
    )}>
        <div className={clsx(
            "px-6 py-4 flex items-center justify-between border-b transition-colors",
            color === 'emerald' ? 'bg-emerald-50/30 border-emerald-50' :
            color === 'blue' ? 'bg-blue-50/30 border-blue-50' :
            color === 'purple' ? 'bg-purple-50/30 border-purple-50' :
            color === 'amber' ? 'bg-amber-50/30 border-amber-50' : 'bg-rose-50/30 border-rose-50'
        )}>
            <div className="flex items-center gap-3">
                <div className={clsx(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12",
                    color === 'emerald' ? 'bg-emerald-500 text-white shadow-emerald-200' :
                    color === 'blue' ? 'bg-blue-600 text-white shadow-blue-200' :
                    color === 'purple' ? 'bg-purple-600 text-white shadow-purple-200' :
                    color === 'amber' ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-rose-500 text-white shadow-rose-200'
                )}>
                    <Icon size={18} strokeWidth={3} />
                </div>
                <span className="font-black text-slate-900 text-sm tracking-tight lowercase">protocol::{title}</span>
            </div>
            {active && (
                <div className={clsx(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    color === 'emerald' ? 'bg-emerald-500' :
                    color === 'blue' ? 'bg-blue-500' :
                    color === 'purple' ? 'bg-purple-500' :
                    color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                )} />
            )}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

export const TriggerNode = memo(({ data }: NodeProps) => {
    return (
        <NodeWrapper title="Trigger" icon={Zap} color="amber">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Entrance Pattern</div>
            <div className="font-black text-slate-900 text-sm lowercase italic px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 mb-1">
                {String(data.label || 'Incoming Event')}
            </div>
            <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-amber-500 border-4 border-white shadow-lg" />
        </NodeWrapper>
    );
});

export const MessageNode = memo(({ id, data }: NodeProps) => {
    const { updateNodeData } = useReactFlow();

    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateNodeData(id, { text: evt.target.value });
    }, [id, updateNodeData]);

    return (
        <NodeWrapper title="Send Message" icon={MessageSquare} color="blue">
            <Handle type="target" position={Position.Top} className="w-4 h-4 bg-blue-500 border-4 border-white shadow-lg" />
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Payload content</div>
            <textarea
                className="text-sm font-bold bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white w-full min-h-[100px] resize-none outline-none transition-all nodrag cursor-text text-slate-900 placeholder:text-slate-200 shadow-inner"
                value={String(data.text || '')}
                onChange={onChange}
                placeholder="e.g. hello, how can i help today?"
            />
            <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-blue-500 border-4 border-white shadow-lg" />
        </NodeWrapper>
    );
});

export const TemplateNode = memo(({ id, data }: NodeProps) => {
    const { updateNodeData } = useReactFlow();

    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { templateName: evt.target.value });
    }, [id, updateNodeData]);

    return (
        <NodeWrapper title="Vector" icon={FileText} color="purple">
            <Handle type="target" position={Position.Top} className="w-4 h-4 bg-purple-500 border-4 border-white shadow-lg" />
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Template Identity</div>
            <div className="relative group">
                <input
                    className="w-full text-sm font-black text-purple-700 bg-purple-50 p-4 rounded-2xl border-2 border-transparent focus:border-purple-500 focus:bg-white outline-none transition-all nodrag cursor-text pr-10 shadow-inner"
                    value={String(data.templateName || '')}
                    onChange={onChange}
                    placeholder="template_name_v2"
                />
                <Sparkles size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none group-focus-within:text-purple-600 transition-colors" />
            </div>
            <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-purple-500 border-4 border-white shadow-lg" />
        </NodeWrapper>
    );
});

export const ConditionNode = memo(({ id, data }: NodeProps) => {
    const { updateNodeData } = useReactFlow();

    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { condition: evt.target.value });
    }, [id, updateNodeData]);

    return (
        <div className="min-w-[280px] bg-white rounded-[32px] shadow-2xl border-2 border-slate-50 overflow-hidden relative group">
            <Handle type="target" position={Position.Top} className="w-4 h-4 bg-rose-500 border-4 border-white shadow-lg" />
            <div className="px-6 py-4 flex items-center justify-between bg-rose-50/30 border-b border-rose-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200">
                        <Split size={18} strokeWidth={3} />
                    </div>
                    <span className="font-black text-slate-900 text-sm tracking-tight lowercase">protocol::Condition</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            </div>
            
            <div className="p-6 space-y-8 pb-12 transition-all">
                <div className="space-y-3">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logical Filter</div>
                    <input
                        className="w-full text-center text-sm font-black bg-slate-50 p-4 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl outline-none transition-all nodrag cursor-text shadow-inner placeholder:text-slate-200 italic"
                        value={String(data.condition || '')}
                        onChange={onChange}
                        placeholder="user says 'price'"
                    />
                </div>

                <div className="flex justify-between items-center px-4">
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Logic_Positive</div>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner">
                            <CheckCircle2 size={14} strokeWidth={3} />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-right">
                        <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Logic_Negative</div>
                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-inner">
                            <AlertCircle size={14} strokeWidth={3} />
                        </div>
                    </div>
                </div>

                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="true"
                    style={{ left: '25%' }}
                    className="w-4 h-4 bg-emerald-500 border-4 border-white shadow-lg"
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="false"
                    style={{ left: '75%' }}
                    className="w-4 h-4 bg-rose-500 border-4 border-white shadow-lg"
                />
            </div>
        </div>
    );
});
