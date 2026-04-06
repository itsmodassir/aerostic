'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';
import {
    Send, Search, User, Filter, MoreVertical, Phone, Video,
    Check, CheckCheck, Clock, AlertCircle, Smile, Paperclip,
    Archive, Star, Tag, UserPlus, ChevronDown, Bot, MessageSquare, MessageCircle,
    RefreshCw, ArrowLeft, Settings2, Bell, Users, Inbox,
    Circle, Mic, Image, FileText, X, Plus, Zap, Pause, Play, Timer,
    ChevronRight, LayoutTemplate, ShieldCheck, Gem, Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getCachedConversations, setCachedConversations,
    getCachedMessages, setCachedMessages
} from '@/lib/indexedDB';
import ConversationItem from '@/components/inbox/ConversationItem';
import MessageBubble from '@/components/inbox/MessageBubble';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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

interface Message {
    id: string;
    direction: 'in' | 'out';
    type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'template';
    content: any;
    status: 'sent' | 'delivered' | 'read' | 'failed' | 'received';
    createdAt: string;
    sender?: TeamMember;
    metaMessageId?: string;
}

export default function InboxPage() {
    const params = useParams();
    const { user } = useAuth();
    const { socket, joinTenant, leaveTenant, isConnected } = useSocket();
    
    // --- State ---
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [tenantId, setTenantId] = useState<string>('');
    const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    
    // Filters & UI
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showContactDetails, setShowContactDetails] = useState(false);
    const [loading, setLoading] = useState(true);

    // AI & Meta Logic
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [templates, setTemplates] = useState<any[]>([]);
    const [templateRates, setTemplateRates] = useState<any>({ marketing: 1.05, utility: 0.20, authentication: 0.15, default: 0.80 });
    const [aiStatus, setAiStatus] = useState<{
        aiMode: 'ai' | 'human' | 'paused';
        pauseSecondsLeft: number;
        windowSecondsLeft: number | null;
        windowExpired: boolean;
    } | null>(null);
    const [aiModeLoading, setAiModeLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Initial Load ---
    useEffect(() => {
        const init = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug || !user) return;

            try {
                const res = await api.get('/auth/workspaces');
                const activeMembership = res.data.find((m: any) =>
                    m.tenant?.slug === workspaceSlug || m.tenant?.id === workspaceSlug
                );

                if (activeMembership?.tenant?.id) {
                    const tid = activeMembership.tenant.id;
                    setTenantId(tid);
                    setCurrentUser({
                        id: user.id || '1',
                        name: user.name || 'Agent',
                        email: user.email || '',
                        role: user.role === 'super_admin' ? 'admin' : 'agent',
                        status: 'online',
                    });

                    // Background fetch supplemental data
                    const [teamRes, walletRes, templatesRes] = await Promise.all([
                        api.get(`/users?tenantId=${tid}`, { headers: { 'x-tenant-id': tid } }).catch(() => ({ data: [] })),
                        api.get(`/billing/wallet/balance?tenantId=${tid}`, { headers: { 'x-tenant-id': tid } }).catch(() => ({ data: { balance: 0 } })),
                        api.get(`/templates?tenantId=${tid}`, { headers: { 'x-tenant-id': tid } }).catch(() => ({ data: [] }))
                    ]);

                    setTeamMembers(teamRes.data.map((u: any) => ({
                        id: u.id, name: u.name, email: u.email, role: 'agent', status: 'online'
                    })));
                    setWalletBalance(walletRes.data.balance || 0);
                    setTemplateRates(walletRes.data.rates || { default: walletRes.data.templateRate || 0.80 });
                    setTemplates(templatesRes.data.filter((t: any) => t.status === 'APPROVED'));
                }
            } catch (e) {
                console.error('Inbox initialization failed', e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [user, params.workspaceId]);

    // --- Socket & Context ---
    useEffect(() => {
        if (tenantId && isConnected) {
            joinTenant(tenantId);
            return () => leaveTenant(tenantId);
        }
    }, [tenantId, isConnected, joinTenant, leaveTenant]);

    useEffect(() => {
        if (!socket) return;
        const handleNewMessage = (payload: any) => {
            if (payload.conversationId === selectedConversation?.id) {
                setMessages(prev => [...prev, {
                    id: payload.id || `msg-${Date.now()}`,
                    direction: payload.direction,
                    type: payload.type,
                    content: payload.content,
                    status: 'received',
                    createdAt: payload.timestamp || new Date().toISOString(),
                }]);
            }
            // Update conversation list last message
            setConversations(prev => prev.map(c => 
                c.id === payload.conversationId 
                ? { ...c, lastMessage: payload.content?.body || payload.type, lastMessageAt: new Date().toISOString(), unreadCount: selectedConversation?.id === payload.conversationId ? c.unreadCount : c.unreadCount + 1 } 
                : c
            ));
        };
        socket.on('newMessage', handleNewMessage);
        return () => { socket.off('newMessage', handleNewMessage); };
    }, [socket, selectedConversation?.id]);

    // --- Data Fetching ---
    useEffect(() => {
        if (!tenantId || !currentUser) return;
        const fetchConvs = async () => {
            try {
                const res = await api.get('/messages/conversations', { headers: { 'x-tenant-id': tenantId } });
                setConversations(res.data);
                setCachedConversations(tenantId, currentUser.id, res.data);
            } catch (e) {}
        };
        fetchConvs();
    }, [tenantId, currentUser?.id]);

    useEffect(() => {
        if (!selectedConversation || !tenantId || !currentUser) return;
        const fetchMsgs = async () => {
            try {
                const res = await api.get(`/messages/conversations/${selectedConversation.id}`, { headers: { 'x-tenant-id': tenantId } });
                setMessages(res.data);
                setCachedMessages(tenantId, currentUser.id, selectedConversation.id, res.data);
                // Fetch AI status
                const statusRes = await api.get(`/messages/conversations/${selectedConversation.id}/status`, { headers: { 'x-tenant-id': tenantId } });
                setAiStatus(statusRes.data);
            } catch (e) {}
        };
        fetchMsgs();
    }, [selectedConversation?.id, tenantId, currentUser?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- Handlers ---
    const handleSend = async () => {
        if (!inputText.trim() || !selectedConversation) return;
        const tempId = `temp-${Date.now()}`;
        const body = inputText;
        setInputText('');
        
        const optimisticMsg: Message = {
            id: tempId, direction: 'out', type: 'text', content: { body },
            status: 'sent', createdAt: new Date().toISOString(), sender: currentUser || undefined
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const res = await api.post('/messages/send', {
                to: selectedConversation.contact.phoneNumber,
                type: 'text',
                payload: { text: body }
            });
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: res.data.messageId, metaMessageId: res.data.metaId, status: 'delivered' } : m));
        } catch (e) {
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedConversation) return;

        const tempId = `file-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: tempId, direction: 'out', type: 'document',
            content: { body: `Uploading ${file.name}...` },
            status: 'received', createdAt: new Date().toISOString(), sender: currentUser || undefined
        }]);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await api.post('/messages/upload', formData); // Axios handles multipart automatically
            
            const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document';
            const sendRes = await api.post('/messages/send', {
                to: selectedConversation.contact.phoneNumber,
                type,
                payload: { id: uploadRes.data.id, caption: file.name }
            });

            setMessages(prev => prev.map(m => m.id === tempId ? {
                ...m, id: sendRes.data.messageId, type, content: { url: URL.createObjectURL(file), filename: file.name }, status: 'delivered'
            } : m));
        } catch (e) {
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
        }
    };

    const handleSetAiMode = async (mode: 'ai' | 'human' | 'paused') => {
        if (!selectedConversation) return;
        setAiModeLoading(true);
        try {
            await api.post(`/messages/conversations/${selectedConversation.id}/ai-mode`, { mode });
            const res = await api.get(`/messages/conversations/${selectedConversation.id}/status`);
            setAiStatus(res.data);
        } catch (e) {} finally { setAiModeLoading(false); }
    };

    // --- Filter Logic ---
    const filteredConversations = useMemo(() => {
        return conversations.filter(c => {
            const matchesSearch = c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.contact.phoneNumber.includes(searchQuery);
            const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
            const matchesAssignee = filterAssignee === 'all' || (filterAssignee === 'me' && c.assignedTo?.id === currentUser?.id) || (filterAssignee === 'unassigned' && !c.assignedTo);
            return matchesSearch && matchesStatus && matchesAssignee;
        });
    }, [conversations, searchQuery, filterStatus, filterAssignee, currentUser?.id]);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-50 rounded-[40px]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Secure Streams...</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white sm:rounded-[48px] rounded-[32px] overflow-hidden shadow-2xl border-2 border-slate-50 relative">
            <AnimatePresence mode="wait">
            {/* Sidebar - Conversation List */}
            <div className={clsx(
                "w-full md:w-[400px] border-r-2 border-slate-50 bg-white flex flex-col transition-all z-10",
                selectedConversation && "hidden md:flex"
            )}>
                <div className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-[18px] shadow-lg shadow-blue-100 flex items-center justify-center">
                                <Inbox size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Inbox</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Unified Channels</p>
                            </div>
                        </div>
                        <button onClick={() => setShowFilters(!showFilters)} className={clsx("p-3 rounded-2xl transition-all", showFilters ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}>
                            <Filter size={20} />
                        </button>
                    </div>

                    <div className="relative group mb-6">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find high-value contacts..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] text-sm font-bold outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>

                    <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'all', label: 'Global', active: filterAssignee === 'all', count: conversations.length },
                            { id: 'me', label: 'Mine', active: filterAssignee === 'me', count: conversations.filter(c => c.assignedTo?.id === currentUser?.id).length },
                            { id: 'unassigned', label: 'Queue', active: filterAssignee === 'unassigned', count: conversations.filter(c => !c.assignedTo).length }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilterAssignee(f.id)}
                                className={clsx(
                                    "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2",
                                    f.active ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                                )}
                            >
                                {f.label} <span className={clsx("ml-1 opacity-40", f.active && "opacity-60")}>{f.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-12">
                    {filteredConversations.length === 0 ? (
                        <div className="py-20 text-center opacity-20">
                            <MessageSquare size={48} className="mx-auto mb-4" />
                            <p className="font-black text-sm uppercase tracking-widest">No matching threads</p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isActive={selectedConversation?.id === conv.id}
                                onClick={() => setSelectedConversation(conv)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={clsx(
                "flex-1 flex flex-col bg-slate-50 transition-all relative overflow-hidden",
                !selectedConversation && "hidden md:flex"
            )}>
                {selectedConversation ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                        {/* Chat Header */}
                        <div className="px-8 py-5 bg-white border-b-2 border-slate-50 flex items-center justify-between z-20">
                            <div className="flex items-center gap-4 min-w-0">
                                <button onClick={() => setSelectedConversation(null)} className="md:hidden p-3 bg-slate-50 rounded-2xl text-slate-400"><ArrowLeft size={20} /></button>
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-100">
                                        {selectedConversation.contact.name.charAt(0)}
                                    </div>
                                    <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-lg shadow-sm" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-black text-slate-900 truncate tracking-tight">{selectedConversation.contact.name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Phone size={10} /> {selectedConversation.contact.phoneNumber}</span>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Now</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {aiStatus && (
                                    <div className={clsx(
                                        "hidden lg:flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all",
                                        aiStatus.aiMode === 'ai' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"
                                    )}>
                                        <div className={clsx("w-2 h-2 rounded-full", aiStatus.aiMode === 'ai' ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{aiStatus.aiMode === 'ai' ? 'AI Automating' : 'Handover Active'}</span>
                                        <div className="w-px h-4 bg-current opacity-10 mx-1" />
                                        <button 
                                            disabled={aiModeLoading}
                                            onClick={() => handleSetAiMode(aiStatus.aiMode === 'ai' ? 'human' : 'ai')}
                                            className="text-[10px] font-black uppercase hover:underline"
                                        >
                                            {aiStatus.aiMode === 'ai' ? 'Intervene' : 'Engage'}
                                        </button>
                                    </div>
                                )}
                                <button onClick={() => setShowContactDetails(!showContactDetails)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all border border-transparent shadow-sm"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-1 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {messages.map((msg, i) => (
                                    <MessageBubble 
                                        key={msg.id} 
                                        message={msg} 
                                        isLastInGroup={i === messages.length - 1 || messages[i + 1].direction !== msg.direction}
                                    />
                                ))}
                            </AnimatePresence>
                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        {/* Composer Area */}
                        <div className="p-10 pt-4 bg-white/80 backdrop-blur-xl border-t-2 border-slate-50 z-20">
                            {/* Templates Quick Launch */}
                            <AnimatePresence>
                                {showTemplates && (
                                    <motion.div 
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 20, opacity: 0 }}
                                        className="mb-6 p-8 bg-slate-900 rounded-[32px] border border-slate-800 shadow-2xl max-h-[400px] overflow-y-auto custom-scrollbar"
                                    >
                                        <div className="flex items-center justify-between mb-8">
                                            <h4 className="text-white text-xl font-black tracking-tight flex items-center gap-3">
                                                <div className="p-2 bg-blue-600 rounded-xl"><Gem size={20} /></div>
                                                High-Impact Templates
                                            </h4>
                                            <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/5 text-[10px] font-black text-white/60 uppercase tracking-widest">
                                                Vault: ₹{walletBalance.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {templates.map(t => (
                                                <button key={t.id} className="text-left p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl transition-all group">
                                                    <p className="text-white font-black text-sm uppercase tracking-tight mb-2">{t.name}</p>
                                                    <p className="text-[11px] text-white/40 font-medium line-clamp-2 leading-relaxed mb-4">{t.components?.find((c: any) => c.type === 'BODY')?.text}</p>
                                                    <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                                                        <Sparkles size={12} className="fill-blue-400" /> Dispatch Signature
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center gap-5">
                                <div className="flex gap-2.5">
                                    <button 
                                        onClick={() => setShowTemplates(!showTemplates)}
                                        className={clsx(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2",
                                            showTemplates ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200" : "bg-slate-50 text-slate-400 border-transparent hover:border-slate-200"
                                        )}
                                    >
                                        <Zap size={22} strokeWidth={2.5} />
                                    </button>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:border-slate-200 transition-all border-2 border-transparent flex items-center justify-center p-0"
                                    >
                                        <Paperclip size={22} strokeWidth={2.5} />
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                </div>

                                <div className="flex-1 relative">
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                        placeholder="Type into the stream..."
                                        rows={1}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-8 py-5 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 resize-none max-h-40 shadow-inner"
                                    />
                                </div>

                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    disabled={!inputText.trim()}
                                    className="h-14 w-20 bg-blue-600 text-white rounded-[22px] shadow-2xl shadow-blue-200 flex items-center justify-center disabled:opacity-30 transition-all active:bg-blue-700"
                                >
                                    <Send size={24} strokeWidth={3} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white">
                        <div className="relative mb-12">
                            <div className="w-48 h-48 bg-slate-50 rounded-[48px] rotate-6 absolute inset-0 -z-10" />
                            <div className="w-48 h-48 bg-white border-2 border-slate-50 rounded-[48px] shadow-2xl shadow-slate-100 flex items-center justify-center">
                                <MessageSquare size={80} className="text-blue-500/20" strokeWidth={1} />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Select Stream</h3>
                        <p className="text-slate-400 font-bold max-w-xs leading-relaxed uppercase tracking-widest text-[11px]">Choose a communication vector from the left to begin high-fidelity engagement.</p>
                    </div>
                )}
            </div>
            </AnimatePresence>

            {/* Meta Contact Details Drawer */}
            <AnimatePresence>
                {showContactDetails && selectedConversation && (
                    <motion.div 
                        initial={{ x: 400 }}
                        animate={{ x: 0 }}
                        exit={{ x: 400 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed sm:relative inset-y-0 right-0 w-full sm:w-[400px] bg-white border-l-2 border-slate-50 flex flex-col shadow-2xl z-[100]"
                    >
                        <div className="p-8 border-b-2 border-slate-50 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Lead Intelligence</h3>
                            <button onClick={() => setShowContactDetails(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400"><X size={20} strokeWidth={3} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                            <div className="flex flex-col items-center">
                                <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white text-5xl font-black mb-6 shadow-2xl shadow-blue-200">
                                    {selectedConversation.contact.name.charAt(0)}
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{selectedConversation.contact.name}</h4>
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="font-black text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-2"><Phone size={12} /> {selectedConversation.contact.phoneNumber}</p>
                                    {selectedConversation.contact.isVIP && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-[9px] font-black text-amber-600 uppercase tracking-widest shadow-sm">
                                            <Star size={10} className="fill-amber-500" /> VIP
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CRM Attributes */}
                            <div className="space-y-6">
                                <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2">Market Segmentation</h5>
                                <div className="flex flex-wrap gap-2">
                                    {selectedConversation.contact.groups?.length ? selectedConversation.contact.groups.map(g => (
                                        <div key={g} className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl text-[10px] font-black text-blue-700 uppercase tracking-widest">
                                            {g}
                                        </div>
                                    )) : (
                                        <p className="text-[10px] font-bold text-slate-300 italic ml-2">No groups assigned</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-[32px] border-2 border-transparent hover:border-slate-100 transition-all group">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 group-hover:text-slate-400 transition-colors">Stage</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedConversation.status}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[32px] border-2 border-transparent hover:border-slate-100 transition-all group">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 group-hover:text-slate-400 transition-colors">Priority</p>
                                    <p className="text-sm font-black text-rose-600 uppercase tracking-tight">{selectedConversation.priority}</p>
                                </div>
                            </div>

                            {/* Meta Window Logic */}
                            {aiStatus && (
                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2">Meta Session Health</h5>
                                    <div className={clsx(
                                        "p-6 rounded-[32px] border-2 transition-all",
                                        aiStatus.windowExpired ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"
                                    )}>
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={clsx(
                                                    "p-2 rounded-xl text-white",
                                                    aiStatus.windowExpired ? "bg-rose-500" : "bg-emerald-500"
                                                )}>
                                                    <Timer size={16} />
                                                </div>
                                                <span className={clsx("text-[10px] font-black uppercase tracking-widest", aiStatus.windowExpired ? "text-rose-700" : "text-emerald-700")}>
                                                    {aiStatus.windowExpired ? 'Window Closed' : 'Session Window'}
                                                </span>
                                            </div>
                                            {!aiStatus.windowExpired && (
                                                <span className="text-[14px] font-black text-emerald-900 tabular-nums">
                                                    {Math.floor(aiStatus.windowSecondsLeft! / 3600)}h {Math.floor((aiStatus.windowSecondsLeft! % 3600) / 60)}m
                                                </span>
                                            )}
                                        </div>
                                        <p className={clsx("text-[11px] font-medium leading-relaxed", aiStatus.windowExpired ? "text-rose-600" : "text-emerald-600")}>
                                            {aiStatus.windowExpired 
                                                ? "The 24h customer window has closed. You must send a template to initiate a new session." 
                                                : "Free-form messaging is active. AI will auto-respond until window expiration or human intervention."
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2">Channel Context</h5>
                                <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-[32px] border border-blue-100/50">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                         <MessageCircle size={24} fill="white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">WhatsApp Cloud</p>
                                        <p className="text-sm font-bold text-blue-900 leading-none">High-Fidelity Protocol</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-10 bg-slate-50/50 border-t-2 border-slate-50">
                            <button className="w-full py-5 bg-white border-2 border-slate-100 text-rose-600 font-black rounded-3xl hover:bg-rose-50 hover:border-rose-100 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                                <Archive size={18} strokeWidth={2.5} /> Archive Intelligence
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
