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
    Circle, Mic, Image, FileText, X, Plus
} from 'lucide-react';
import { clsx } from 'clsx';

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const params = useParams();
    const { user } = useAuth();
    const { socket, joinTenant, leaveTenant, isConnected } = useSocket();

    // Init: Get user info and team members
    useEffect(() => {
        let mounted = true;
        const initInbox = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug || !user) return;

            try {
                // Resolve tenant
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

                    // Join tenant room
                    joinTenant(tid);

                    // Fetch real team members
                    try {
                        const teamRes = await api.get(`/users?tenantId=${tid}`);
                        if (teamRes.data && mounted) {
                            setTeamMembers(teamRes.data.map((u: any) => ({
                                id: u.id,
                                name: u.name,
                                email: u.email,
                                role: u.role === 'admin' ? 'admin' : 'agent',
                                status: 'online'
                            })));
                        }
                    } catch (e) {
                        console.error('Failed to fetch team');
                    }
                }
            } catch (e) {
                console.error('Failed to init inbox');
            }
        };

        if (user) {
            initInbox();
        }

        return () => {
            mounted = false;
        };
    }, [user, params.workspaceId]); // Removed tenantId, joinTenant, leaveTenant if they change frequently

    // Handle Leave Tenant on unmount or tenantId change
    useEffect(() => {
        if (tenantId) {
            return () => leaveTenant(tenantId);
        }
    }, [tenantId, leaveTenant]);

    // Handle Real-time Socket Events
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (payload: any) => {
            console.log('[Inbox] New Socket Message:', payload);

            // 1. Update messages list if this conversation is active
            if (selectedConversation?.id === payload.conversationId) {
                const newMessage: Message = {
                    id: payload.id || `msg-${Date.now()}`,
                    direction: payload.direction,
                    type: payload.type,
                    content: payload.content,
                    status: 'received',
                    createdAt: payload.timestamp || new Date().toISOString(),
                };
                setMessages(prev => [...prev, newMessage]);
            }

            // 2. Update conversations list (last message, unread count)
            setConversations(prev => prev.map(conv => {
                if (conv.id === payload.conversationId) {
                    return {
                        ...conv,
                        lastMessage: payload.content.body || payload.type,
                        lastMessageAt: payload.timestamp || new Date().toISOString(),
                        unreadCount: selectedConversation?.id === payload.conversationId
                            ? conv.unreadCount
                            : conv.unreadCount + 1
                    };
                }
                return conv;
            }));
        };

        const handleMessageStatus = (payload: any) => {
            console.log('[Inbox] Message Status Update:', payload);
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

    // Fetch conversations from API (Initial load only, then sync via socket)
    useEffect(() => {
        if (!tenantId) return;
        const fetchConvs = async () => {
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
                } else {
                    setConversations([]);
                }
            } catch (e) {
                console.error('Failed to fetch conversations');
                setConversations([]);
            }
        };
        fetchConvs();
    }, [tenantId]);

    // Fetch messages when conversation selected (Initial load)
    useEffect(() => {
        if (!selectedConversation) {
            setMessages(prev => prev.length > 0 ? [] : prev);
            return;
        }

        const fetchMsgs = async () => {
            try {
                const res = await api.get(`/messages/conversations/${selectedConversation.id}?tenantId=${tenantId}`);
                if (res.data) {
                    setMessages(res.data);
                } else {
                    setMessages([]);
                }
            } catch (e) {
                setMessages([]);
            }
        };

        fetchMsgs();
    }, [selectedConversation?.id, tenantId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Filter conversations
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

        // Optimistic update
        const newMessage: Message = {
            id: `temp-${Date.now()}`,
            direction: 'out',
            type: 'text',
            content: { body: inputText },
            status: 'sent',
            createdAt: new Date().toISOString(),
            sender: currentUser || undefined,
        };
        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        setShowQuickReplies(false);

        try {
            await api.post('/messages/send', {
                tenantId,
                to: selectedConversation.contact.phoneNumber,
                type: 'text',
                payload: { text: inputText }
            });

            // Update message status
            setMessages(prev => prev.map(m =>
                m.id === newMessage.id ? { ...m, status: 'delivered' } : m
            ));
        } catch (e) {
            setMessages(prev => prev.map(m =>
                m.id === newMessage.id ? { ...m, status: 'failed' } : m
            ));
        }
    };

    const handleQuickReply = (text: string) => {
        setInputText(text);
        setShowQuickReplies(false);
    };

    const handleAssign = (member: TeamMember) => {
        if (!selectedConversation) return;
        setConversations(prev => prev.map(c =>
            c.id === selectedConversation.id ? { ...c, assignedTo: member } : c
        ));
        setSelectedConversation(prev => prev ? { ...prev, assignedTo: member } : null);
        setShowAssignModal(false);
    };

    const handleStatusChange = (status: Conversation['status']) => {
        if (!selectedConversation) return;
        setConversations(prev => prev.map(c =>
            c.id === selectedConversation.id ? { ...c, status } : c
        ));
        setSelectedConversation(prev => prev ? { ...prev, status } : null);
    };

    const handleStar = (convId: string) => {
        setConversations(prev => prev.map(c =>
            c.id === convId ? { ...c, isStarred: !c.isStarred } : c
        ));
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            open: 'bg-green-100 text-green-700',
            pending: 'bg-amber-100 text-amber-700',
            resolved: 'bg-blue-100 text-blue-700',
            snoozed: 'bg-gray-100 text-gray-700',
        };
        return colors[status] || colors.open;
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            high: 'text-red-500',
            medium: 'text-amber-500',
            low: 'text-green-500',
        };
        return colors[priority] || colors.medium;
    };

    const getMessageStatus = (status: string) => {
        switch (status) {
            case 'sent': return <Check className="w-3 h-3 text-gray-400" />;
            case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-400" />;
            case 'read': return <CheckCheck className="w-3 h-3 text-blue-500" />;
            case 'failed': return <AlertCircle className="w-3 h-3 text-red-500" />;
            default: return <Clock className="w-3 h-3 text-gray-300" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const stats = {
        total: conversations.length,
        unassigned: conversations.filter(c => !c.assignedTo).length,
        open: conversations.filter(c => c.status === 'open').length,
        myChats: conversations.filter(c => c.assignedTo?.id === currentUser?.id).length,
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-gray-100 rounded-2xl overflow-hidden shadow-lg relative">
            {/* Sidebar - Conversation List */}
            <div className={clsx(
                "w-full md:w-96 border-r bg-white flex flex-col transition-all",
                selectedConversation && "hidden md:flex"
            )}>
                {/* Header */}
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Inbox className="w-5 h-5 text-blue-600" />
                            Team Inbox
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Filter className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                        <button
                            onClick={() => setFilterAssignee('all')}
                            className={`p-2 rounded-lg text-center transition-colors ${filterAssignee === 'all' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                            <p className="text-[10px] text-gray-500">All</p>
                        </button>
                        <button
                            onClick={() => setFilterAssignee('me')}
                            className={`p-2 rounded-lg text-center transition-colors ${filterAssignee === 'me' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <p className="text-lg font-bold text-blue-600">{stats.myChats}</p>
                            <p className="text-[10px] text-gray-500">Mine</p>
                        </button>
                        <button
                            onClick={() => setFilterAssignee('unassigned')}
                            className={`p-2 rounded-lg text-center transition-colors ${filterAssignee === 'unassigned' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <p className="text-lg font-bold text-amber-600">{stats.unassigned}</p>
                            <p className="text-[10px] text-gray-500">Unassigned</p>
                        </button>
                        <button
                            onClick={() => setFilterStatus('open')}
                            className={`p-2 rounded-lg text-center transition-colors ${filterStatus === 'open' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <p className="text-lg font-bold text-green-600">{stats.open}</p>
                            <p className="text-[10px] text-gray-500">Open</p>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-3 pt-3 border-t flex gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
                            >
                                <option value="all">All Status</option>
                                <option value="open">Open</option>
                                <option value="pending">Pending</option>
                                <option value="resolved">Resolved</option>
                                <option value="snoozed">Snoozed</option>
                            </select>
                            <select
                                value={filterAssignee}
                                onChange={(e) => setFilterAssignee(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
                            >
                                <option value="all">All Agents</option>
                                <option value="me">Assigned to Me</option>
                                <option value="unassigned">Unassigned</option>
                                {teamMembers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No conversations found</p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                className={clsx(
                                    "p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors relative",
                                    selectedConversation?.id === conv.id && "bg-blue-50 border-l-4 border-l-blue-600"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {conv.contact.name.charAt(0)}
                                        </div>
                                        {conv.isBot && (
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                                <Bot className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-gray-900 truncate flex items-center gap-1">
                                                {conv.contact.name}
                                                {conv.isStarred && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                                            </h4>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {formatTime(conv.lastMessageAt)}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-500 truncate mb-2">
                                            {conv.lastMessage || 'No messages yet'}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadge(conv.status)}`}>
                                                    {conv.status}
                                                </span>
                                                {conv.priority && (
                                                    <Circle className={`w-2 h-2 fill-current ${getPriorityColor(conv.priority)}`} />
                                                )}
                                                {conv.contact.tags?.map(tag => (
                                                    <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {conv.assignedTo && (
                                                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600" title={conv.assignedTo.name}>
                                                        {conv.assignedTo.name.charAt(0)}
                                                    </div>
                                                )}
                                                {conv.unreadCount > 0 && (
                                                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
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
                        <div className="px-4 md:px-6 py-4 bg-white border-b flex items-center justify-between">
                            <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                                <button
                                    onClick={() => setSelectedConversation(null)}
                                    className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-600"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-base md:text-lg">
                                        {selectedConversation.contact.name.charAt(0)}
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 truncate">{selectedConversation.contact.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium hidden sm:inline-block ${getStatusBadge(selectedConversation.status)}`}>
                                            {selectedConversation.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                        <Phone className="w-3 h-3" />
                                        {selectedConversation.contact.phoneNumber}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 md:gap-2">
                                {/* Assignment - Compressed on mobile */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowAssignModal(!showAssignModal)}
                                        className="flex items-center gap-2 p-2 md:px-3 md:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <UserPlus className="w-4 h-4 text-gray-500" />
                                        <span className="hidden lg:inline text-sm text-gray-500">
                                            {selectedConversation.assignedTo ? selectedConversation.assignedTo.name : 'Assign'}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:inline" />
                                    </button>
                                    {/* ... modal logic stays same ... */}

                                    {showAssignModal && (
                                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border overflow-hidden z-10">
                                            <div className="p-3 border-b">
                                                <p className="text-sm font-medium text-gray-700">Assign to team member</p>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto">
                                                {teamMembers.map(member => (
                                                    <button
                                                        key={member.id}
                                                        onClick={() => handleAssign(member)}
                                                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="relative">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                                {member.name.charAt(0)}
                                                            </div>
                                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-green-500' :
                                                                member.status === 'away' ? 'bg-amber-500' : 'bg-gray-400'
                                                                }`} />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                                            <p className="text-xs text-gray-500">{member.role}</p>
                                                        </div>
                                                        {selectedConversation.assignedTo?.id === member.id && (
                                                            <Check className="w-4 h-4 text-blue-600" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Status Dropdown - Hidden on XS */}
                                <select
                                    value={selectedConversation.status}
                                    onChange={(e) => handleStatusChange(e.target.value as any)}
                                    className="hidden sm:inline-block px-3 py-2 bg-gray-100 rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="open">Open</option>
                                    <option value="pending">Pending</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="snoozed">Snoozed</option>
                                </select>

                                {/* Star */}
                                <button
                                    onClick={() => handleStar(selectedConversation.id)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Star className={`w-5 h-5 ${selectedConversation.isStarred ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                                </button>

                                {/* More Options */}
                                <button
                                    onClick={() => setShowContactDetails(!showContactDetails)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg) => {
                                const isOut = msg.direction === 'out';
                                return (
                                    <div key={msg.id} className={clsx("flex", isOut ? "justify-end" : "justify-start")}>
                                        <div className={clsx("max-w-[65%] group", isOut ? "items-end" : "items-start")}>
                                            {!isOut && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-gray-500">{selectedConversation.contact.name}</span>
                                                </div>
                                            )}
                                            {isOut && msg.sender && (
                                                <div className="flex items-center gap-2 mb-1 justify-end">
                                                    <span className="text-xs text-gray-500">{msg.sender.name}</span>
                                                </div>
                                            )}
                                            <div className={clsx(
                                                "rounded-2xl px-4 py-3 shadow-sm",
                                                isOut
                                                    ? "bg-blue-600 text-white rounded-br-md"
                                                    : "bg-white text-gray-800 rounded-bl-md border"
                                            )}>
                                                {msg.type === 'text' && <p className="text-sm">{msg.content.body}</p>}
                                                {msg.type === 'image' && (
                                                    <div className="rounded-lg overflow-hidden">
                                                        <Image className="w-48 h-32 text-gray-400" />
                                                    </div>
                                                )}

                                                <div className={clsx(
                                                    "flex items-center gap-1 mt-1",
                                                    isOut ? "justify-end" : "justify-start"
                                                )}>
                                                    <span className={clsx(
                                                        "text-[10px]",
                                                        isOut ? "text-blue-100" : "text-gray-400"
                                                    )}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isOut && getMessageStatus(msg.status)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border rounded-bl-md">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-white border-t">
                            {/* Quick Replies */}
                            {showQuickReplies && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {QUICK_REPLIES.map((reply, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleQuickReply(reply)}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-end gap-3">
                                {/* Attachment */}
                                <div className="flex gap-1">
                                    <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setShowQuickReplies(!showQuickReplies)}
                                        className={`p-2.5 rounded-lg transition-colors ${showQuickReplies ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Input */}
                                <div className="flex-1 relative">
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        rows={1}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Send */}
                                <button
                                    onClick={handleSend}
                                    disabled={!inputText.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a conversation</h3>
                        <p className="text-gray-400">Choose a chat from the sidebar to start messaging</p>
                    </div>
                )}
            </div>

            {/* Contact Details Sidebar - Overlay on mobile */}
            {showContactDetails && selectedConversation && (
                <div className="absolute inset-y-0 right-0 w-80 bg-white border-l flex flex-col shadow-2xl z-20 md:relative md:shadow-none">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Contact Details</h3>
                        <button
                            onClick={() => setShowContactDetails(false)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Profile */}
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                                {selectedConversation.contact.name.charAt(0)}
                            </div>
                            <h4 className="font-bold text-gray-900">{selectedConversation.contact.name}</h4>
                            <p className="text-sm text-gray-500">{selectedConversation.contact.phoneNumber}</p>
                        </div>

                        {/* Tags */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedConversation.contact.tags?.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                        {tag}
                                    </span>
                                ))}
                                <button className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1 hover:bg-gray-200">
                                    <Plus className="w-3 h-3" />
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Actions</p>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">Call Contact</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <Archive className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">Archive Chat</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <Bot className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">Enable AI Bot</span>
                                </button>
                            </div>
                        </div>

                        {/* Assigned To */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Assigned To</p>
                            {selectedConversation.assignedTo ? (
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                        {selectedConversation.assignedTo.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{selectedConversation.assignedTo.name}</p>
                                        <p className="text-xs text-gray-500">{selectedConversation.assignedTo.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAssignModal(true)}
                                    className="w-full flex items-center gap-3 px-3 py-2 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">Assign to team member</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
