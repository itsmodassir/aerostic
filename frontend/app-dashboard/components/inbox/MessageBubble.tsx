'use client';

import React from 'react';
import { clsx } from 'clsx';
import { 
    Check, CheckCheck, Clock, AlertCircle, Play,
    FileText, Image as ImageIcon, Download, Share2, 
    RotateCcw, Sparkles, Workflow
} from 'lucide-react';
import { motion } from 'framer-motion';
import OrderCard from './OrderCard';
import { useDashboard } from '../dashboard/DashboardContext';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'agent';
    status: 'online' | 'away' | 'offline';
}

interface Message {
    id: string;
    direction: 'in' | 'out';
    type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'template' | 'interactive' | 'order';
    content: any;
    status: 'sent' | 'delivered' | 'read' | 'failed' | 'received';
    createdAt: string;
    sender?: TeamMember;
    metaMessageId?: string;
    error?: string;
}

interface MessageBubbleProps {
    message: Message;
    isLastInGroup: boolean;
    onRetry?: (msg: Message) => void;
}

const getRenderableText = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && 'text' in (value as Record<string, unknown>)) {
        const text = (value as Record<string, unknown>).text;
        return typeof text === 'string' ? text : '';
    }
    return '';
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLastInGroup, onRetry }) => {
    const { membership } = useDashboard();
    const isOut = message.direction === 'out';
    const isFailed = message.status === 'failed';
    const failureLabel = message.error?.trim() || 'Send failed';
    
    const formatMessageTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderContent = () => {
        const bodyText = getRenderableText(message.content?.body);
        const textBody = getRenderableText(message.content?.text?.body);
        const captionText = getRenderableText(message.content?.caption);
        const interactiveBodyText =
            getRenderableText(message.content?.interactive?.body?.text) ||
            getRenderableText(message.content?.interactive?.body);

        switch (message.type) {
            case 'image':
                return (
                    <div className="space-y-3">
                        <div className="relative group/media overflow-hidden rounded-[20px] border border-white/10 shadow-lg">
                            <img 
                                src={message.content?.mediaUrl || message.content?.image?.link || message.content?.url} 
                                alt="Attachment" 
                                className="max-w-full transition-transform duration-500 group-hover/media:scale-105"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Image+Expired';
                                }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"><Download size={18} /></button>
                                <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"><Share2 size={18} /></button>
                            </div>
                        </div>
                        {bodyText && <p className="text-[13px] font-medium leading-relaxed px-1">{bodyText}</p>}
                    </div>
                );
            case 'video':
                return (
                    <div className="space-y-3">
                        <div className="relative rounded-[20px] overflow-hidden border border-white/10 shadow-lg">
                            <video 
                                src={message.content?.mediaUrl || message.content?.video?.link || message.content?.url} 
                                controls 
                                className="max-w-full aspect-video bg-black"
                            />
                        </div>
                        {bodyText && <p className="text-[13px] font-medium leading-relaxed px-1">{bodyText}</p>}
                    </div>
                );
            case 'document':
                return (
                    <div className={clsx(
                        "flex items-center gap-4 p-4 rounded-[20px] border transition-all hover:shadow-md",
                        isOut ? "bg-white/10 border-white/20" : "bg-slate-50/50 border-slate-100"
                    )}>
                        <div className={clsx(
                            "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner",
                            isOut ? "bg-white/20 text-white" : "bg-white text-blue-600 border border-slate-100"
                        )}>
                            <FileText size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={clsx("text-xs font-black truncate", isOut ? "text-white" : "text-slate-800")}>
                                {captionText || message.content?.document?.filename || message.content?.filename || 'Document File'}
                            </p>
                            <p className={clsx("text-[9px] font-black uppercase tracking-widest mt-0.5", isOut ? "text-white/40" : "text-slate-400")}>
                                {parseInt(message.id.slice(-2), 16) % 3 + 1} MB • PDF Document
                            </p>
                        </div>
                        <Download size={18} className={isOut ? "text-white/40" : "text-slate-300"} />
                    </div>
                );
            case 'audio':
                return (
                    <div className="flex items-center gap-4 py-1 pr-4 min-w-[200px]">
                        <button className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95",
                            isOut ? "bg-white text-blue-600 shadow-blue-900/20" : "bg-blue-600 text-white shadow-blue-100"
                        )}>
                            <Play size={16} fill="currentColor" />
                        </button>
                        <div className="flex-1 flex flex-col gap-1.5">
                            <div className="flex items-end gap-0.5 h-6">
                                {[...Array(20)].map((_, i) => {
                                    const h = (parseInt(message.id.slice(-2), 16) + (i * 13)) % 100;
                                    return (
                                        <div key={i} className={clsx("w-1 rounded-full", isOut ? "bg-white/20" : "bg-slate-200")} style={{ height: `${h}%` }} />
                                    );
                                })}
                            </div>
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-40">
                                <span>0:00</span>
                                <span>0:24</span>
                            </div>
                        </div>
                    </div>
                );
            case 'template':
                return (
                    <div className={clsx(
                        "p-5 rounded-[24px] border space-y-4",
                        isOut ? "bg-white/10 border-white/20" : "bg-blue-50/30 border-blue-100/50"
                    )}>
                        <div className="flex items-center gap-2 text-blue-600">
                            <ImageIcon size={14} strokeWidth={3} className={isOut ? "text-blue-300" : "text-blue-600"} />
                            <span className={clsx("text-[10px] font-black uppercase tracking-[0.2em]", isOut ? "text-blue-100" : "text-blue-600")}>Official Template</span>
                        </div>
                        <p className={clsx("text-sm font-bold leading-relaxed", isOut ? "text-white" : "text-slate-800")}>
                            {bodyText || message.content?.template?.name}
                        </p>
                        <div className="pt-2">
                             <button className={clsx(
                                 "w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                 isOut ? "bg-white/20 text-white hover:bg-white/30" : "bg-white text-blue-600 border border-blue-100 hover:bg-blue-50"
                             )}>
                                 View Interaction
                             </button>
                        </div>
                    </div>
                );
            case 'interactive':
                if (message.content?.type === 'flow') {
                    const flowParameters = message.content?.action?.parameters || {};
                    return (
                        <div className={clsx(
                            "p-5 rounded-[24px] border space-y-4",
                            isOut ? "bg-white/10 border-white/20" : "bg-indigo-50/70 border-indigo-100"
                        )}>
                            <div className="flex items-center gap-2">
                                <div className={clsx(
                                    "w-8 h-8 rounded-2xl flex items-center justify-center",
                                    isOut ? "bg-white/15 text-white" : "bg-indigo-600 text-white"
                                )}>
                                    <Workflow size={15} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className={clsx("text-[10px] font-black uppercase tracking-[0.2em]", isOut ? "text-indigo-100" : "text-indigo-600")}>
                                        WhatsApp Flow
                                    </p>
                                    <p className={clsx("text-xs font-semibold", isOut ? "text-white/80" : "text-slate-500")}>
                                        {flowParameters.flow_cta || 'Open flow'}
                                    </p>
                                </div>
                            </div>
                            <p className={clsx("text-sm font-bold leading-relaxed", isOut ? "text-white" : "text-slate-800")}>
                                {bodyText || 'Please complete this flow to continue.'}
                            </p>
                            <div className={clsx(
                                "rounded-2xl px-4 py-3 flex items-center justify-between gap-3",
                                isOut ? "bg-black/10 border border-white/10" : "bg-white border border-indigo-100"
                            )}>
                                <div className="min-w-0">
                                    <p className={clsx("text-[10px] font-black uppercase tracking-[0.2em]", isOut ? "text-white/60" : "text-slate-400")}>
                                        Flow Delivery
                                    </p>
                                    <p className={clsx("text-xs font-semibold truncate", isOut ? "text-white" : "text-slate-700")}>
                                        {flowParameters.flow_id || 'Meta published flow'}
                                    </p>
                                </div>
                                <div className={clsx(
                                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em]",
                                    isOut ? "bg-white/15 text-white" : "bg-indigo-50 text-indigo-700"
                                )}>
                                    <Sparkles size={12} />
                                    Launch
                                </div>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className={clsx(
                        "p-5 rounded-[24px] border space-y-3",
                        isOut ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-200"
                    )}>
                        <p className={clsx("text-[10px] font-black uppercase tracking-[0.2em]", isOut ? "text-white/70" : "text-slate-500")}>
                            Interactive Message
                        </p>
                        <p className={clsx("text-sm font-semibold leading-relaxed", isOut ? "text-white" : "text-slate-800")}>
                            {bodyText || interactiveBodyText || 'Interactive WhatsApp content'}
                        </p>
                    </div>
                );
            case 'order':
                return (
                    <OrderCard 
                        orderData={message.content?.order || message.content} 
                        tenantId={membership?.tenantId || ''}
                        isEcho={isOut}
                    />
                );
            default:
                return (
                    <div className="relative">
                        <p className="text-[13.5px] font-bold leading-relaxed whitespace-pre-wrap select-text">
                            {bodyText || textBody || (typeof message.content === 'string' ? message.content : '')}
                        </p>
                    </div>
                );
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={clsx(
                "flex flex-col group",
                isOut ? "items-end pl-12" : "items-start pr-12",
                isLastInGroup ? "mb-8" : "mb-1.5"
            )}
        >
            <div className="flex items-end gap-2 max-w-full">
                {!isOut && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-black mb-1 shrink-0 shadow-lg shadow-blue-100">
                         {message.sender?.name?.charAt(0) || 'A'}
                    </div>
                )}
                
                <div className="flex flex-col items-end gap-1">
                    <div className={clsx(
                        "px-5 py-4 shadow-sm relative transition-all duration-300 whitespace-normal break-words overflow-hidden",
                        isOut 
                            ? "bg-blue-600 text-white rounded-[24px] rounded-br-[4px] shadow-xl shadow-blue-600/10" 
                            : "bg-white text-slate-800 rounded-[24px] rounded-bl-[4px] border-2 border-slate-50 shadow-md",
                        isFailed && "border-2 border-rose-200 bg-rose-50/50"
                    )}>
                        {renderContent()}

                        <div className={clsx(
                            "flex items-center gap-2 mt-3 transition-opacity",
                            isOut ? "text-white/60" : "text-slate-400"
                        )}>
                            <span className="text-[9px] font-black tracking-widest uppercase tabular-nums">
                                {formatMessageTime(message.createdAt)}
                            </span>
                            {isOut && (
                                <div className="flex items-center">
                                    {message.status === 'sent' && <Check size={10} strokeWidth={3} />}
                                    {message.status === 'delivered' && <CheckCheck size={10} strokeWidth={3} />}
                                    {message.status === 'read' && <CheckCheck size={10} strokeWidth={3} className="text-teal-300" />}
                                    {message.status === 'failed' && <AlertCircle size={10} strokeWidth={3} className="text-rose-400" />}
                                    {message.status === 'received' && <Clock size={10} strokeWidth={3} className="animate-pulse" />}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Failure Feedback */}
                    {isFailed && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                             <div className="flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                                 <AlertCircle size={10} /> 
                                 {failureLabel}
                             </div>
                             <button 
                                onClick={() => onRetry?.(message)}
                                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-colors"
                             >
                                 <RotateCcw size={10} /> Retry
                             </button>
                        </div>
                    )}
                </div>
            </div>

            {isLastInGroup && message.sender && isOut && (
                <div className="mt-2 flex items-center gap-2 px-1">
                    <span className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">
                        Handled by {message.sender.name}
                    </span>
                    <div className="w-1.5 h-1.5 bg-slate-100 rounded-full" />
                </div>
            )}
        </motion.div>
    );
};

export default React.memo(MessageBubble);
