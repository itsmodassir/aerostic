'use client';

import React from 'react';
import { clsx } from 'clsx';
import { 
    MessageSquare, Bot, Star, Circle, 
    MessageCircle, Hash, Clock, Smartphone, 
    LayoutTemplate, Instagram, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'agent';
    status: 'online' | 'away' | 'offline';
}

interface Conversation {
    id: string;
    contact: {
        id: string;
        name: string;
        phoneNumber: string;
        avatar?: string;
        tags?: string[];
        isVIP?: boolean;
        groups?: string[];
    };
    lastMessage?: string;
    lastMessageAt: string;
    unreadCount: number;
    status: 'open' | 'pending' | 'resolved' | 'snoozed';
    priority: 'high' | 'medium' | 'low';
    assignedTo?: TeamMember;
    isStarred?: boolean;
    isBot?: boolean;
    channel: 'whatsapp' | 'instagram' | 'email';
}

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, isActive, onClick }) => {
    const hasUnread = conversation.unreadCount > 0;
    
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 86400000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={clsx(
                "w-full px-6 py-5 flex gap-5 transition-all relative overflow-hidden group border-b border-slate-50",
                isActive ? "bg-blue-50/40" : "hover:bg-slate-50/80 bg-white"
            )}
        >
            {/* Active Indicator Strip */}
            <AnimatePresence>
                {isActive && (
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        exit={{ height: 0 }}
                        className="absolute left-0 top-0 w-1.5 bg-blue-600 rounded-r-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                    />
                )}
            </AnimatePresence>
            
            {/* Avatar Stack */}
            <div className="relative shrink-0">
                <div className={clsx(
                    "w-14 h-14 rounded-[22px] flex items-center justify-center border-2 transition-all p-0.5 overflow-hidden",
                    isActive ? "border-blue-600 bg-white shadow-lg shadow-blue-100" : "border-slate-100 bg-slate-50 group-hover:border-slate-300"
                )}>
                    {conversation.contact.avatar ? (
                        <img src={conversation.contact.avatar} alt={conversation.contact.name} className="w-full h-full object-cover rounded-[18px]" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-xl rounded-[18px]">
                            {conversation.contact.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                    )}
                </div>

                {/* Channel & Status Overlay */}
                <div className="absolute -right-1 -bottom-1 flex items-center -space-x-1">
                    <div className={clsx(
                        "w-6 h-6 rounded-lg border-2 border-white flex items-center justify-center shadow-md",
                        conversation.channel === 'whatsapp' ? "bg-emerald-500" : "bg-indigo-500"
                    )}>
                        {conversation.channel === 'whatsapp' && <MessageCircle size={10} className="text-white fill-white" />}
                        {conversation.channel === 'instagram' && <Instagram size={10} className="text-white" />}
                    </div>
                </div>
                
                {hasUnread && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border-2 border-white rounded-full animate-pulse shadow-lg" />
                )}
            </div>

            {/* Conversation Metadata */}
            <div className="flex-1 min-w-0 text-left pt-1">
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className={clsx(
                        "text-[15px] truncate tracking-tight transition-colors",
                        hasUnread ? "font-black text-slate-900" : "font-black text-slate-700",
                        isActive && "text-blue-900"
                    )}>
                        {conversation.contact.name || conversation.contact.phoneNumber}
                    </h3>
                    <span className={clsx(
                        "text-[10px] font-black tabular-nums transition-colors",
                        hasUnread ? "text-blue-600" : "text-slate-300"
                    )}>
                        {formatTime(conversation.lastMessageAt)}
                    </span>
                </div>
                
                <div className="flex justify-between items-center gap-2">
                    <p className={clsx(
                        "text-xs truncate transition-colors",
                        hasUnread ? "text-slate-900 font-bold" : "text-slate-400 font-medium"
                    )}>
                        {conversation.isBot && <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mr-2">[AI]</span>}
                        {conversation.lastMessage || 'Sent an attachment'}
                    </p>
                    
                        {hasUnread && (
                        <motion.span 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }}
                            className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-blue-100 uppercase tracking-wider"
                        >
                            {conversation.unreadCount} New
                        </motion.span>
                    )}
                </div>

                {/* VIP & Groups Preview */}
                {(conversation.contact.isVIP || (conversation.contact.groups && conversation.contact.groups.length > 0)) && (
                    <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
                        {conversation.contact.isVIP && (
                            <div className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-100">
                                <Star size={10} className="fill-amber-500" /> VIP
                            </div>
                        )}
                        {conversation.contact.groups?.slice(0, 1).map(g => (
                            <div key={g} className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded-lg border border-blue-100 truncate max-w-[100px]">
                                {g}
                            </div>
                        ))}
                        {(conversation.contact.groups?.length || 0) > 1 && (
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">
                                +{conversation.contact.groups!.length - 1}
                            </span>
                        )}
                    </div>
                )}

                {/* Badges & Tags */}
                <div className="flex items-center gap-2 mt-3 overflow-hidden">
                    <div className={clsx(
                        "flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-[0.1em] transition-all",
                        conversation.status === 'open' ? "bg-emerald-50 text-emerald-700 border-emerald-100/50" :
                        conversation.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-100/50" :
                        "bg-slate-50 text-slate-500 border-slate-100"
                    )}>
                        <Circle size={6} fill="currentColor" className={conversation.status === 'open' ? 'animate-pulse' : ''} />
                        {conversation.status}
                    </div>
                    
                    {conversation.priority === 'high' && (
                        <div className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-100/50 rounded-lg text-[8px] font-black uppercase tracking-[0.1em]">
                            Priority
                        </div>
                    )}

                    {conversation.assignedTo && !isActive && (
                        <div className="flex items-center gap-1.5 ml-auto text-[9px] font-bold text-slate-300 group-hover:text-slate-400 transition-colors">
                            <Smartphone size={10} /> {conversation.assignedTo.name.split(' ')[0]}
                        </div>
                    )}
                    
                    {isActive && (
                        <motion.div 
                            layoutId="activeCaret"
                            className="ml-auto text-blue-600"
                        >
                            <LayoutTemplate size={12} strokeWidth={2.5} />
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.button>
    );
};

export default React.memo(ConversationItem);
