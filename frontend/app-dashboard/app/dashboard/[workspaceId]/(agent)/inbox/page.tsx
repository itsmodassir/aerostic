'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';
import {
    Send, Search, User, Filter, MoreVertical, Phone, Video,
    Check, CheckCheck, Clock, AlertCircle, Smile, Paperclip,
    Archive, Star, Tag, UserPlus, ChevronDown, Bot, MessageSquare,
    RefreshCw, ArrowLeft, Settings2, Bell, Users, Inbox,
    Circle, Mic, Image, FileText, X, Plus, Zap, Pause, Play, Timer
} from 'lucide-react';
import { clsx } from 'clsx';
import {
    getCachedConversations, setCachedConversations,
    getCachedMessages, setCachedMessages, clearCacheForUser
} from '@/lib/indexedDB';

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
    type: 'text' | 'image' | 'document' | 'audio' | 'template';
    content: any;
    status: 'sent' | 'delivered' | 'read' | 'failed' | 'received';
    createdAt: string;
    sender?: TeamMember;
}

const QUICK_REPLIES = [
    "Thank you for contacting us!",
    "Let me check and get back to you.",
    "Is there anything else I can help with?",
    "Our team will contact you shortly.",
    "Please share your order ID.",
];

export default function InboxPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [tenantId, setTenantId] = useState<string>('');
    const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showContactDetails, setShowContactDetails] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(false);

    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [templates, setTemplates] = useState<any[]>([]);
    const [showTemplates, setShowTemplates] = useState(false);
    const [templateRates, setTemplateRates] = useState<any>({ marketing: 1.05, utility: 0.20, authentication: 0.15, default: 0.80 });

    const [aiStatus, setAiStatus] = useState<{
        aiMode: 'ai' | 'human' | 'paused';
        pauseSecondsLeft: number;
        windowSecondsLeft: number | null;
        windowExpired: boolean;
        defaultPauseMinutes: number;
    } | null>(null);
    const [aiModeLoading, setAiModeLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const params = useParams();
    const { user } = useAuth();
    const { socket, joinTenant, leaveTenant, isConnected } = useSocket();

    useEffect(() => {
        let mounted = true;
        const initInbox = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug || !user) return;

            if (typeof window !== 'undefined' && 'Notification' in window) {
                if (Notification.permission === 'default') {
                    Notification.requestPermission();
                }
            }

            try {
                const res = await api.get('/auth/workspaces');
                const memberships = res.data;
                const activeMembership = memberships.find((m: any) => m.tenant?.slug === workspaceSlug);

                if (activeMembership && activeMembership.tenant?.id && mounted) {
                    const tid = activeMembership.tenant.id;
                    setTenantId(tid);

                    setCurrentUser({
                        id: user.id || '1',
                        name: user.name || user.email?.split('@')[0] || 'User',
                        email: user.email || '',
                        role: user.role === 'super_admin' ? 'admin' : 'agent',
                        status: 'online',
                    });
                    try {
                        const [teamRes, walletRes, templatesRes] = await Promise.all([
                            api.get(`/users?tenantId=${tid}`).catch(e => ({ data: [] })),
                            api.get(`/billing/wallet/balance?tenantId=${tid}`).catch(e => ({ data: { balance: 0, rates: { marketing: 1.05, utility: 0.20, authentication: 0.15, default: 0.80 } } })),
                            api.get(`/templates?tenantId=${tid}`).catch(e => ({ data: [] }))
                        ]);

                        if (teamRes.data && mounted) {
                            setTeamMembers(teamRes.data.map((u: any) => ({
                                id: u.id,
                                name: u.name,
                                email: u.email,
                                role: u.role === 'admin' ? 'admin' : 'agent',
                                status: 'online'
                            })));
                        }

                        if (walletRes.data && mounted) {
                            setWalletBalance(walletRes.data.balance || 0);
                            setTemplateRates(walletRes.data.rates || { default: walletRes.data.templateRate || 0.80 });
                        }

                        if (templatesRes.data && mounted) {
                            setTemplates(templatesRes.data.filter((t: any) => t.status === 'APPROVED'));
                        }

                    } catch (e) {
                        console.error('Failed to fetch inbox initial data', e);
                    }
                }
            } catch (e) {
                console.error('Failed to init inbox', e);
            }
        };

        if (user) {
            initInbox();
        }

        return () => {
            mounted = false;
        };
    }, [user, params.workspaceId]);

    useEffect(() => {
        if (tenantId && isConnected) {
            joinTenant(tenantId);
            return () => leaveTenant(tenantId);
        }
    }, [tenantId, isConnected, joinTenant, leaveTenant]);

    const fetchAiStatus = async (convId: string) => {
        try {
            const res = await api.get(`/messages/conversations/${convId}/status`);
            setAiStatus(res.data);
        } catch (e) {
            console.error('Failed to fetch AI status', e);
        }
    };

    useEffect(() => {
        if (!selectedConversation) { setAiStatus(null); return; }
        fetchAiStatus(selectedConversation.id);
        const interval = setInterval(() => fetchAiStatus(selectedConversation.id), 30000);
        return () => clearInterval(interval);
    }, [selectedConversation?.id]);

    const handleSetAiMode = async (mode: 'ai' | 'human' | 'paused', pauseMinutes?: number) => {
        if (!selectedConversation) return;
        setAiModeLoading(true);
        try {
            await api.post(`/messages/conversations/${selectedConversation.id}/ai-mode`, { mode, pauseMinutes });
            await fetchAiStatus(selectedConversation.id);
        } catch (e) {
            console.error('Failed to set AI mode', e);
        } finally {
            setAiModeLoading(false);
        }
    };

    const formatSeconds = (secs: number) => {
        if (secs <= 0) return '0s';
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (payload: any) => {
            if (payload.direction === 'out' && payload.agentId) return;

            if (selectedConversation?.id === payload.conversationId) {
                const newMessage: Message = {
                    id: payload.id || `msg-${Date.now()}`,
                    direction: payload.direction,
                    type: payload.type,
                    content: payload.content,
                    status: 'received',
                    createdAt: payload.timestamp || new Date().toISOString(),
                };
                setMessages(prev => {
                    const newMessages = [...prev, newMessage];
                    if (currentUser?.id) setCachedMessages(tenantId, currentUser.id, payload.conversationId, newMessages);
                    return newMessages;
                });
            } else {
                if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                    new Notification(`New message from ${payload.phone || 'Customer'}`, {
                        body: payload.content?.body || 'Received a file or image',
                        icon: '/favicon.ico'
                    });
                }
            }

            setConversations(prev => {
                const newConvs = prev.map(conv => {
                    if (conv.id === payload.conversationId) {
                        return {
                            ...conv,
                            lastMessage: payload.content?.body || payload.type,
                            lastMessageAt: payload.timestamp || new Date().toISOString(),
                            unreadCount: selectedConversation?.id === payload.conversationId
                                ? conv.unreadCount
                                : conv.unreadCount + 1
                        };
                    }
                    return conv;
                });
                if (tenantId && currentUser?.id) setCachedConversations(tenantId, currentUser.id, newConvs);
                return newConvs;
            });
        };

        const handleMessageStatus = (payload: any) => {
            setMessages(prev => prev.map(m =>
                (m.id === payload.messageId || (m as any).metaMessageId === payload.metaMessageId)
                    ? { ...m, status: payload.status }
                    : m
            ));
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('messageStatus', handleMessageStatus);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('messageStatus', handleMessageStatus);
        };
    }, [socket, selectedConversation?.id]);

    useEffect(() => {
        if (!tenantId || !currentUser?.id) return;
        const fetchConvs = async () => {
            const cached = await getCachedConversations(tenantId, currentUser.id);
            if (cached) setConversations(cached);

            try {
                const res = await api.get(`/messages/conversations?tenantId=${tenantId}`);
                if (res.data) {
                    const mapped = res.data.map((conv: any) => ({
                        ...conv,
                        unreadCount: conv.unreadCount || 0,
                        status: conv.status || 'open',
                        priority: conv.priority || 'medium',
                        channel: 'whatsapp',
                    }));
                    setConversations(mapped);
                    setCachedConversations(tenantId, currentUser.id, mapped);
                }
            } catch (e) {
                if (!cached) setConversations([]);
            }
        };
        fetchConvs();
    }, [tenantId, currentUser?.id]);

    useEffect(() => {
        if (!selectedConversation || !currentUser?.id) {
            setMessages(prev => prev.length > 0 ? [] : prev);
            return;
        }

        const fetchMsgs = async () => {
            const cached = await getCachedMessages(tenantId, currentUser.id, selectedConversation.id);
            if (cached) setMessages(cached);

            try {
                const res = await api.get(`/messages/conversations/${selectedConversation.id}?tenantId=${tenantId}`);
                if (res.data) {
                    setMessages(res.data);
                    setCachedMessages(tenantId, currentUser.id, selectedConversation.id, res.data);
                }
            } catch (e) {
                if (!cached) setMessages([]);
            }
        };

        fetchMsgs();
    }, [selectedConversation?.id, tenantId, currentUser?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedConversation?.id]);

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.contact.phoneNumber.includes(searchQuery);
        const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;
        const matchesAssignee = filterAssignee === 'all' ||
            (filterAssignee === 'unassigned' && !conv.assignedTo) ||
            (filterAssignee === 'me' && conv.assignedTo?.id === currentUser?.id) ||
            conv.assignedTo?.id === filterAssignee;
        return matchesSearch && matchesStatus && matchesAssignee;
    });

    const handleSend = async () => {
        if (!inputText.trim() || !selectedConversation) return;

        const newMessage: Message = {
            id: `temp-${Date.now()}`,
            direction: 'out',
            type: 'text',
            content: { body: inputText },
            status: 'sent',
            createdAt: new Date().toISOString(),
            sender: currentUser || undefined,
        };
        setMessages(prev => {
            const newMessages = [...prev, newMessage];
            if (currentUser?.id) setCachedMessages(tenantId, currentUser.id, selectedConversation.id, newMessages);
            return newMessages;
        });
        setInputText('');
        setShowQuickReplies(false);

        try {
            await api.post('/messages/send', {
                tenantId,
                to: selectedConversation.contact.phoneNumber,
                type: 'text',
                payload: { text: inputText }
            });

            setMessages(prev => {
                const updated = prev.map(m =>
                    m.id === newMessage.id ? { ...m, status: 'delivered' } : m
                );
                if (currentUser?.id) setCachedMessages(tenantId, currentUser.id, selectedConversation.id, updated as Message[]);
                return updated as Message[];
            });
        } catch (e) {
            setMessages(prev => {
                const updated = prev.map(m =>
                    m.id === newMessage.id ? { ...m, status: 'failed' } : m
                );
                if (currentUser?.id) setCachedMessages(tenantId, currentUser.id, selectedConversation.id, updated as Message[]);
                return updated as Message[];
            });
        }
    };

    const handleSendTemplate = async (template: any) => {
        if (!selectedConversation) return;
        const category = (template.category || 'marketing').toLowerCase();
        const templateRate = templateRates[category] || templateRates.default || 0.80;

        if (walletBalance < templateRate) {
            alert(`Insufficient wallet balance.`);
            return;
        }

        setShowTemplates(false);
        const payload = {
            name: template.name,
            language: { code: template.language || 'en_US' },
            components: [{ type: "body", parameters: [{ type: "text", text: selectedConversation.contact.name || "Customer" }] }]
        };

        const newMessage: Message = {
            id: `temp-${Date.now()}`,
            direction: 'out',
            type: 'template',
            content: payload,
            status: 'sent',
            createdAt: new Date().toISOString(),
            sender: currentUser || undefined,
        };
        setMessages(prev => [...prev, newMessage]);

        try {
            await api.post('/messages/send', {
                tenantId, to: selectedConversation.contact.phoneNumber,
                type: 'template', payload,
            });
            setWalletBalance(prev => prev - templateRate);
            setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m));
        } catch (e) {
            setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'failed' } : m));
        }
    };

    const handleQuickReply = (text: string) => {
        setInputText(text);
        setShowQuickReplies(false);
    };

    const handleAssign = (member: TeamMember) => {
        if (!selectedConversation) return;
        setConversations(prev => prev.map(c => c.id === selectedConversation.id ? { ...c, assignedTo: member } : c));
        setSelectedConversation(prev => prev ? { ...prev, assignedTo: member } : null);
        setShowAssignModal(false);
    };

    const handleStatusChange = (status: Conversation['status']) => {
        if (!selectedConversation) return;
        setConversations(prev => prev.map(c => c.id === selectedConversation.id ? { ...c, status } : c));
        setSelectedConversation(prev => prev ? { ...prev, status } : null);
    };

    const handleStar = (convId: string) => {
        setConversations(prev => prev.map(c => c.id === convId ? { ...c, isStarred: !c.isStarred } : c));
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            open: 'bg-green-50 text-green-700 border-green-100',
            pending: 'bg-amber-50 text-amber-700 border-amber-100',
            resolved: 'bg-blue-50 text-blue-700 border-blue-100',
            snoozed: 'bg-gray-50 text-gray-700 border-gray-100',
        };
        return colors[status] || colors.open;
    };

    const getMessageStatus = (status: string) => {
        switch (status) {
            case 'sent': return <Check className="w-3 h-3 text-white/60" />;
            case 'delivered': return <CheckCheck className="w-3 h-3 text-white/60" />;
            case 'read': return <CheckCheck className="w-3 h-3 text-white" />;
            case 'failed': return <AlertCircle className="w-3 h-3 text-red-300" />;
            default: return <Clock className="w-3 h-3 text-white/40" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffHours < 48) return 'Yesterday';
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const stats = {
        total: conversations.length,
        unassigned: conversations.filter(c => !c.assignedTo).length,
        open: conversations.filter(c => c.status === 'open').length,
        myChats: conversations.filter(c => c.assignedTo?.id === currentUser?.id).length,
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white sm:rounded-[40px] rounded-[32px] overflow-hidden shadow-2xl border-2 border-gray-50 relative animate-in fade-in duration-500">
            {/* Sidebar - Conversation List */}
            <div className={clsx(
                "w-full md:w-96 border-r-2 border-gray-50 bg-white flex flex-col transition-all",
                selectedConversation && "hidden md:flex"
            )}>
                {/* Header */}
                <div className="p-6 border-b-2 border-gray-50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Inbox size={20} /></div>
                            Inbox
                        </h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowFilters(!showFilters)} className={clsx("p-2.5 rounded-xl transition-all", showFilters ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:bg-gray-50")}>
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        {[
                            { label: 'All', count: stats.total, active: filterAssignee === 'all', onClick: () => setFilterAssignee('all'), color: 'text-gray-900' },
                            { label: 'Mine', count: stats.myChats, active: filterAssignee === 'me', onClick: () => setFilterAssignee('me'), color: 'text-blue-600' },
                            { label: 'New', count: stats.unassigned, active: filterAssignee === 'unassigned', onClick: () => setFilterAssignee('unassigned'), color: 'text-amber-600' },
                            { label: 'Open', count: stats.open, active: filterStatus === 'open', onClick: () => setFilterStatus('open'), color: 'text-green-600' },
                        ].map(s => (
                            <button key={s.label} onClick={s.onClick} className={clsx("p-2 rounded-2xl flex flex-col items-center justify-center transition-all border-2", s.active ? "bg-white border-blue-500 shadow-sm" : "bg-gray-50 border-transparent hover:border-gray-100")}>
                                <span className={clsx("text-lg font-black leading-none", s.color)}>{s.count}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">{s.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find customers..."
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all placeholder:text-gray-300"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                    {filteredConversations.length === 0 ? (
                        <div className="p-12 text-center opacity-30">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                            <p className="font-black text-sm uppercase tracking-widest">No chats</p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                className={clsx(
                                    "px-6 py-5 cursor-pointer hover:bg-gray-50 transition-all border-l-4",
                                    selectedConversation?.id === conv.id ? "bg-blue-50/50 border-blue-600" : "border-transparent"
                                )}
                            >
                                <div className="flex gap-4">
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-100">
                                            {conv.contact.name.charAt(0)}
                                        </div>
                                        {conv.isBot && <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm border border-gray-50 text-indigo-500"><Bot size={10} /></div>}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-black text-gray-900 truncate text-sm flex items-center gap-1.5">
                                                {conv.contact.name}
                                                {conv.isStarred && <Star size={10} className="text-amber-500 fill-amber-500" />}
                                            </h4>
                                            <span className="text-[10px] font-black text-gray-300 uppercase whitespace-nowrap">{formatTime(conv.lastMessageAt)}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-bold truncate mb-3">{conv.lastMessage || 'Start a conversation...'}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1.5">
                                                <span className={clsx("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border", getStatusBadge(conv.status))}>{conv.status}</span>
                                            </div>
                                            {conv.unreadCount > 0 && <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black shadow-lg shadow-blue-100">{conv.unreadCount}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={clsx(
                "flex-1 flex flex-col bg-gray-50 transition-all",
                !selectedConversation && "hidden md:flex"
            )}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-5 bg-white border-b-2 border-gray-50 flex items-center justify-between z-10 shadow-sm shadow-gray-500/5">
                            <div className="flex items-center gap-4 min-w-0">
                                <button onClick={() => setSelectedConversation(null)} className="md:hidden p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all"><ArrowLeft size={20} /></button>
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-[18px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg md:text-xl shrink-0 shadow-lg shadow-blue-100">{selectedConversation.contact.name.charAt(0)}</div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-gray-900 truncate">{selectedConversation.contact.name}</h3>
                                        {selectedConversation.isBot && <Bot size={14} className="text-indigo-500" />}
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Phone size={10} /> {selectedConversation.contact.phoneNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowAssignModal(!showAssignModal)} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                                    <UserPlus size={14} /> {selectedConversation.assignedTo ? selectedConversation.assignedTo.name : 'Unassigned'}
                                </button>
                                <button onClick={() => setShowContactDetails(!showContactDetails)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* AI Toolbar */}
                        {aiStatus && (
                            <div className={clsx("px-6 py-2 border-b flex items-center justify-between animate-in slide-in-from-top-4 duration-300 z-0", aiStatus.aiMode === 'ai' ? "bg-emerald-50/50" : "bg-amber-50/50")}>
                                <div className="flex items-center gap-4">
                                    <div className={clsx("px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest", aiStatus.aiMode === 'ai' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                                        {aiStatus.aiMode === 'ai' ? <><Zap size={12} className="fill-emerald-600" /> AI Responding</> : <><User size={12} /> Human Control</>}
                                    </div>
                                    {aiStatus.windowSecondsLeft !== null && (
                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5"><Timer size={12} /> {formatSeconds(aiStatus.windowSecondsLeft)} window left</span>
                                    )}
                                </div>
                                <button onClick={() => handleSetAiMode(aiStatus.aiMode === 'ai' ? 'human' : 'ai')} disabled={aiModeLoading} className={clsx("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", aiStatus.aiMode === 'ai' ? "bg-amber-500 text-white shadow-lg shadow-amber-100" : "bg-emerald-600 text-white shadow-lg shadow-emerald-100")}>
                                    {aiStatus.aiMode === 'ai' ? 'Take Over' : 'Enable AI'}
                                </button>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar bg-gray-50/50">
                            {messages.map((msg) => {
                                const isOut = msg.direction === 'out';
                                return (
                                    <div key={msg.id} className={clsx("flex flex-col", isOut ? "items-end text-right" : "items-start text-left")}>
                                        <div className="flex flex-col gap-1.5 max-w-[85%] sm:max-w-[70%] lg:max-w-[60%]">
                                            <div className={clsx(
                                                "p-4 shadow-xl shadow-gray-200/50 transition-all",
                                                isOut 
                                                    ? "bg-blue-600 text-white rounded-[24px] rounded-br-[4px]" 
                                                    : "bg-white text-gray-800 rounded-[24px] rounded-bl-[4px] border border-gray-100"
                                            )}>
                                                {msg.type === 'text' && <p className="text-sm font-medium leading-relaxed break-words">{msg.content.body}</p>}
                                                {msg.type === 'template' && (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60"><FileText size={12} /> Template Message</div>
                                                        <p className="text-sm font-bold leading-relaxed">{msg.content.name}</p>
                                                    </div>
                                                )}
                                                <div className={clsx("flex items-center gap-2 mt-3", isOut ? "justify-end text-white/50" : "justify-start text-gray-300")}>
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">{formatTime(msg.createdAt)}</span>
                                                    {isOut && getMessageStatus(msg.status)}
                                                </div>
                                            </div>
                                            {isOut && msg.sender && <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mr-2">{msg.sender.name}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                            {isTyping && (
                                <div className="flex justify-start animate-in fade-in slide-in-from-left-4">
                                    <div className="bg-white p-4 rounded-[24px] rounded-bl-[4px] border border-gray-100 shadow-sm">
                                        <div className="flex gap-1.5"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" /><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300" /></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 md:p-8 bg-white border-t-2 border-gray-50 relative rounded-b-[40px]">
                            {/* Templates Drawer Improved */}
                            {showTemplates && (
                                <div className="absolute bottom-full left-0 w-full bg-white border-t-4 border-blue-500 p-8 max-h-96 overflow-y-auto shadow-2xl z-20 animate-in slide-in-from-bottom-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3"><div className="p-2 bg-blue-50 rounded-xl text-blue-600"><FileText size={20} /></div> Templates</h4>
                                        <div className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-black text-gray-500 uppercase tracking-widest border border-gray-100">Wallet: ₹{walletBalance.toFixed(2)}</div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {templates.map(t => (
                                            <button key={t.id} onClick={() => handleSendTemplate(t)} className="text-left p-5 bg-gray-50 border-2 border-transparent hover:border-blue-500 hover:bg-white rounded-[24px] transition-all group active:scale-[0.98]">
                                                <p className="font-black text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">{t.name}</p>
                                                <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed mb-4">{t.components?.find((c: any) => c.type === 'BODY')?.text}</p>
                                                <div className="flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase tracking-widest"><Zap size={10} className="fill-blue-600" /> Send Now</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    <button onClick={() => {setShowTemplates(!showTemplates); setShowQuickReplies(false);}} className={clsx("p-3 rounded-2xl transition-all border-2", showTemplates ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100" : "bg-gray-50 text-gray-400 border-transparent hover:border-gray-100")}><Zap size={20} /></button>
                                    <button className="hidden sm:block p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:border-gray-200 transition-all border-2 border-transparent"><Paperclip size={20} /></button>
                                </div>
                                <div className="flex-1 relative">
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                        placeholder="Write a message..."
                                        rows={1}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[20px] px-6 py-4 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 resize-none max-h-40"
                                    />
                                </div>
                                <button onClick={handleSend} disabled={!inputText.trim()} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-20 flex items-center justify-center active:scale-90"><Send size={24} /></button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 animate-in zoom-in-95 duration-700">
                        <div className="w-32 h-32 bg-white rounded-[40px] shadow-2xl shadow-blue-100 flex items-center justify-center mb-8"><MessageSquare size={64} className="text-blue-500/20" /></div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Select a Conversation</h3>
                        <p className="text-gray-400 font-medium max-w-xs leading-relaxed">Choose a chat from the sidebar to start a premium communication session.</p>
                    </div>
                )}
            </div>

            {/* Contact Details Sidebar - Redesigned */}
            {showContactDetails && selectedConversation && (
                <div className="fixed sm:relative inset-y-0 right-0 w-full sm:w-[350px] bg-white border-l-2 border-gray-50 flex flex-col shadow-2xl z-[100] animate-in slide-in-from-right-full duration-500">
                    <div className="p-6 border-b-2 border-gray-50 flex items-center justify-between bg-gray-50/20">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Overview</h3>
                        <button onClick={() => setShowContactDetails(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-2xl shadow-blue-200">
                                {selectedConversation.contact.name.charAt(0)}
                            </div>
                            <h4 className="text-xl font-black text-gray-900 tracking-tight">{selectedConversation.contact.name}</h4>
                            <div className="flex items-center justify-center gap-2 mt-2 font-bold text-gray-400 text-xs uppercase tracking-widest"><Phone size={12} /> {selectedConversation.contact.phoneNumber}</div>
                        </div>

                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-1">Current Status</h5>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-gray-50 rounded-2xl border-2 border-transparent">
                                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">State</div>
                                    <div className="text-sm font-black text-gray-900 uppercase">{selectedConversation.status}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border-2 border-transparent">
                                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Priority</div>
                                    <div className="text-sm font-black text-gray-900 uppercase">{selectedConversation.priority}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-10 border-t-2 border-gray-50">
                            <h5 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-1">Manage Assignment</h5>
                            {selectedConversation.assignedTo ? (
                                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-[24px] border border-blue-100">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">{selectedConversation.assignedTo.name.charAt(0)}</div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-black text-blue-900 truncate">{selectedConversation.assignedTo.name}</div>
                                        <div className="text-[10px] font-bold text-blue-600 truncate opacity-60">{selectedConversation.assignedTo.email}</div>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setShowAssignModal(true)} className="w-full flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-100 rounded-[28px] text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-all bg-gray-50/30 group">
                                    <UserPlus className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Assign to Team</span>
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="p-8 bg-gray-50/50 border-t-2 border-gray-50">
                        <button className="w-full py-4 bg-white border-2 border-gray-100 text-red-500 font-black rounded-2xl hover:bg-red-50 hover:border-red-100 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                            <Archive size={16} /> Archive Conversation
                        </button>
                    </div>
                </div>
            )}
            
            {/* Assign Modal Overlay */}
            {showAssignModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
                    <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden shadow-indigo-200">
                        <div className="p-8 border-b-2 border-gray-50 bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Assign Team</h3>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                            {teamMembers.map(member => (
                                <button key={member.id} onClick={() => handleAssign(member)} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-[24px] transition-all group">
                                    <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">{member.name.charAt(0)}</div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-black text-gray-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">{member.name}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{member.role}</p>
                                    </div>
                                    {selectedConversation?.assignedTo?.id === member.id && <div className="p-1.5 bg-green-500 rounded-full text-white shadow-lg shadow-green-100"><Check size={12} /></div>}
                                </button>
                            ))}
                        </div>
                        <div className="p-8 bg-gray-50/50 flex gap-4">
                            <button onClick={() => setShowAssignModal(false)} className="flex-1 py-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-gray-400 uppercase tracking-widest text-xs">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
