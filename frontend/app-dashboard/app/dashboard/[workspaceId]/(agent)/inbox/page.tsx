'use client';

import { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue, startTransition } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/hooks/use-toast';
import {
    Send, Search, Filter, MoreVertical, Phone,
    Clock, AlertCircle, Paperclip, Archive, Star,
    MessageSquare, MessageCircle, ArrowLeft, X, Zap, Inbox,
    Timer, Gem, Sparkles, Workflow, Layers3
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getCachedConversations, setCachedConversations,
    getCachedMessages, setCachedMessages
} from '@/lib/indexedDB';
import ConversationItem from '@/components/inbox/ConversationItem';
import MessageBubble from '@/components/inbox/MessageBubble';

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
    lastInboundAt?: string;
    firstInboundAt?: string;
}

interface Message {
    id: string;
    direction: 'in' | 'out';
    type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'template' | 'interactive';
    content: any;
    status: 'sent' | 'delivered' | 'read' | 'failed' | 'received';
    createdAt: string;
    sender?: TeamMember;
    metaMessageId?: string;
    error?: string;
}

interface PublishedFlow {
    id: string;
    name: string;
    status?: string;
    categories?: string[];
}

const buildTenantHeaders = (tenantId: string) => ({
    headers: { 'x-tenant-id': tenantId },
});

const getTextLikeValue = (value: unknown) => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && 'text' in (value as Record<string, unknown>)) {
        const text = (value as Record<string, unknown>).text;
        return typeof text === 'string' ? text : '';
    }
    return '';
};

const getMessagePreview = (payload: any, type?: string) => {
    return (
        getTextLikeValue(payload?.body) ||
        getTextLikeValue(payload?.text?.body) ||
        payload?.interactive?.button_reply?.title ||
        payload?.interactive?.list_reply?.title ||
        getTextLikeValue(payload?.caption) ||
        (type ? `[${type}]` : 'New message')
    );
};

const getTemplateParameters = (text: string | undefined, selectedConversation: Conversation | null) => {
    const matches = text?.match(/{{(\d+)}}/g) || [];
    if (matches.length === 0) return [];

    return matches.map((_, index) => ({
        type: 'text',
        text:
            index === 0
                ? selectedConversation?.contact?.name || 'Customer'
                : index === 1
                    ? selectedConversation?.contact?.phoneNumber || ''
                    : 'Value',
    }));
};

const getTemplateDisplayName = (name: string | undefined) => {
    if (!name) return 'Untitled template';

    return name
        .replace(/[_-]+/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();
};

const getTemplatePreviewText = (template: any) => {
    const body = template?.components?.find((component: any) => component.type === 'BODY')?.text;
    return body || 'Ready-to-send approved WhatsApp template.';
};

const getTemplateCategory = (template: any) => {
    return (template?.category || 'marketing').toString().toLowerCase();
};

const getTemplateRate = (template: any, rates: Record<string, number>) => {
    const category = getTemplateCategory(template);
    return rates?.[category] ?? rates?.default ?? 0;
};

const getFlowLabel = (flow: PublishedFlow) => {
    return flow?.name?.trim() || 'Untitled flow';
};

const getFlowTone = (categories?: string[]) => {
    if (!categories?.length) return 'Customer journey';
    return categories.join(' • ').replace(/_/g, ' ').toLowerCase();
};

export default function InboxPage() {
    const params = useParams();
    const { user } = useAuth();
    const { socket, joinTenant, leaveTenant, isConnected } = useSocket();
    const { toast } = useToast();
    
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
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [quickActionTab, setQuickActionTab] = useState<'templates' | 'flows'>('templates');
    const [showContactDetails, setShowContactDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (loading) {
            timeout = setTimeout(() => setLoadingTimeout(true), 15000); // 15s timeout
        }
        return () => clearTimeout(timeout);
    }, [loading]);

    // AI & Meta Logic
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [templates, setTemplates] = useState<any[]>([]);
    const [publishedFlows, setPublishedFlows] = useState<PublishedFlow[]>([]);
    const [templateRates, setTemplateRates] = useState<any>({ marketing: 1.05, utility: 0.20, authentication: 0.15, default: 0.80 });
    const [sendingTemplateId, setSendingTemplateId] = useState<string | null>(null);
    const [sendingFlowId, setSendingFlowId] = useState<string | null>(null);
    const [aiStatus, setAiStatus] = useState<{
        aiMode: 'ai' | 'human' | 'paused';
        pauseSecondsLeft: number;
        windowSecondsLeft: number | null;
        windowExpired: boolean;
    } | null>(null);
    const [aiModeLoading, setAiModeLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const templatePanelRef = useRef<HTMLDivElement>(null);
    const templateToggleRef = useRef<HTMLButtonElement>(null);
    const deferredSearchQuery = useDeferredValue(searchQuery);

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
                        role: user.role === 'super_admin' || user.role === 'platform_admin' ? 'admin' : 'agent',
                        status: 'online',
                    });

                    // Background fetch supplemental data
                    const [teamRes, walletRes, templatesRes, publishedFlowsRes] = await Promise.all([
                        api.get(`/users?tenantId=${tid}`, buildTenantHeaders(tid)).catch(() => ({ data: [] })),
                        api.get(`/billing/wallet/balance?tenantId=${tid}`, buildTenantHeaders(tid)).catch(() => ({ data: { balance: 0 } })),
                        api.get(`/templates?tenantId=${tid}`, buildTenantHeaders(tid)).catch(() => ({ data: [] })),
                        api.get('/whatsapp/flows/published', buildTenantHeaders(tid)).catch(() => ({ data: [] })),
                    ]);

                    setTeamMembers(teamRes.data.map((u: any) => ({
                        id: u.id, name: u.name, email: u.email, role: 'agent', status: 'online'
                    })));
                    setWalletBalance(walletRes.data.balance || 0);
                    setTemplateRates(walletRes.data.rates || { default: walletRes.data.templateRate || 0.80 });
                    setTemplates(templatesRes.data.filter((t: any) => t.status === 'APPROVED'));
                    setPublishedFlows(Array.isArray(publishedFlowsRes.data) ? publishedFlowsRes.data : []);
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
            // Check if message should be added to current view
            const isCurrentConversation = payload.conversationId === selectedConversation?.id;
            
            if (isCurrentConversation) {
                setMessages(prev => {
                    // Avoid duplicate messages if already sent optimistically
                    if (prev.some(m => m.id === payload.id || (payload.metaId && m.metaMessageId === payload.metaId))) {
                        return prev;
                    }
                    return [...prev, {
                        id: payload.id || `msg-${Date.now()}`,
                        direction: payload.direction,
                        type: payload.type,
                        content: payload.content,
                        status: payload.status || 'received',
                        createdAt: payload.timestamp || new Date().toISOString(),
                    }];
                });
                
                // Refresh AI status to update 24h window
                void fetchConversationStatus(payload.conversationId);
            }

            // Update conversation list last message and session window
            setConversations(prev => prev.map(c =>
                c.id === payload.conversationId
                ? {
                    ...c,
                    lastMessage: getMessagePreview(payload.content, payload.type),
                    lastMessageAt: new Date().toISOString(),
                    lastInboundAt: payload.direction === 'in' ? new Date().toISOString() : c.lastInboundAt,
                    unreadCount: payload.direction === 'in' && !isCurrentConversation ? (c.unreadCount || 0) + 1 : c.unreadCount,
                }
                : c
            ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()));
        };

        const handleMessageStatus = (payload: any) => {
            setMessages(prev => prev.map((message) => {
                const matchesById = payload.messageId && message.id === payload.messageId;
                const matchesByMetaId = payload.metaMessageId && message.metaMessageId === payload.metaMessageId;
                if (!matchesById && !matchesByMetaId) {
                    return message;
                }
                return {
                    ...message,
                    status: payload.status || message.status,
                    error: payload.status === 'failed' ? message.error : undefined,
                };
            }));
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('messageStatus', handleMessageStatus);
        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('messageStatus', handleMessageStatus);
        };
    }, [socket, selectedConversation?.id]);

    // --- Data Fetching ---
    useEffect(() => {
        if (!tenantId || !currentUser) return;
        const fetchConvs = async () => {
            try {
                const res = await api.get('/messages/conversations', buildTenantHeaders(tenantId));
                setConversations(res.data);
                setCachedConversations(tenantId, currentUser.id, res.data);
            } catch (e) {
                const cached = await getCachedConversations(tenantId, currentUser.id);
                if (cached) {
                    setConversations(cached);
                }
            }
        };
        fetchConvs();
    }, [tenantId, currentUser?.id]);

    const fetchConversationStatus = useCallback(async (convId: string) => {
        if (!tenantId) return;
        try {
            const statusRes = await api.get(`/messages/conversations/${convId}/status`, buildTenantHeaders(tenantId));
            setAiStatus(statusRes.data);
        } catch (e) {
            console.error('Failed to fetch conversation status', e);
        }
    }, [tenantId]);

    useEffect(() => {
        if (!selectedConversation || !tenantId || !currentUser) return;
        const fetchMsgs = async () => {
            try {
                const res = await api.get(`/messages/conversations/${selectedConversation.id}`, buildTenantHeaders(tenantId));
                setMessages(res.data);
                setCachedMessages(tenantId, currentUser.id, selectedConversation.id, res.data);
                // Fetch AI status
                void fetchConversationStatus(selectedConversation.id);
            } catch (e) {
                const cached = await getCachedMessages(tenantId, currentUser.id, selectedConversation.id);
                if (cached) {
                    setMessages(cached);
                }
            }
        };
        fetchMsgs();
    }, [selectedConversation?.id, tenantId, currentUser?.id, fetchConversationStatus]);

    useEffect(() => {
        setShowQuickActions(false);
    }, [selectedConversation?.id]);

    useEffect(() => {
        if (!showQuickActions) return;

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (templatePanelRef.current?.contains(target)) return;
            if (templateToggleRef.current?.contains(target)) return;
            setShowQuickActions(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
        };
    }, [showQuickActions]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- Handlers ---
    const handleSelectConversation = useCallback((conversation: Conversation | null) => {
        startTransition(() => {
            setSelectedConversation(conversation);
            setShowContactDetails(false);
        });
    }, []);

    useEffect(() => {
        if (!selectedConversation || !tenantId) return;

        setConversations((prev) => prev.map((conversation) => (
            conversation.id === selectedConversation.id
                ? { ...conversation, unreadCount: 0 }
                : conversation
        )));

        void api.patch(
            `/messages/conversations/${selectedConversation.id}/read`,
            {},
            buildTenantHeaders(tenantId),
        ).catch((error) => {
            console.error('Failed to mark conversation as read', error);
        });
    }, [selectedConversation?.id, tenantId]);

    const handleSend = async () => {
        if (!inputText.trim() || !selectedConversation) return;
        const tempId = `temp-${Date.now()}`;
        const body = inputText;
        setInputText('');
        setShowQuickActions(false);
        
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
            }, buildTenantHeaders(tenantId));
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: res.data.messageId, metaMessageId: res.data.metaId, status: 'sent', error: undefined } : m));
            setConversations(prev => prev.map(c =>
                c.id === selectedConversation.id
                    ? { ...c, lastMessage: body, lastMessageAt: new Date().toISOString(), unreadCount: 0 }
                    : c
            ));
        } catch (e: any) {
            const errorMessage = e?.response?.data?.message || 'Send failed';
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed', error: errorMessage } : m));
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
            const uploadRes = await api.post('/messages/upload', formData, buildTenantHeaders(tenantId)); // Axios handles multipart automatically
            
            const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document';
            const sendRes = await api.post('/messages/send', {
                to: selectedConversation.contact.phoneNumber,
                type,
                payload: { id: uploadRes.data.id, caption: file.name }
            }, buildTenantHeaders(tenantId));

            setMessages(prev => prev.map(m => m.id === tempId ? {
                ...m, id: sendRes.data.messageId, metaMessageId: sendRes.data.metaId, type, content: { url: URL.createObjectURL(file), filename: file.name }, status: 'sent', error: undefined
            } : m));
            setConversations(prev => prev.map(c =>
                c.id === selectedConversation.id
                    ? { ...c, lastMessage: file.name, lastMessageAt: new Date().toISOString() }
                    : c
            ));
        } catch (e: any) {
            const errorMessage = e?.response?.data?.message || 'Upload or send failed';
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed', error: errorMessage } : m));
        }
    };

    const handleSetAiMode = async (mode: 'ai' | 'human' | 'paused') => {
        if (!selectedConversation) return;
        setAiModeLoading(true);
        try {
            await api.post(`/messages/conversations/${selectedConversation.id}/ai-mode`, { mode }, buildTenantHeaders(tenantId));
            const res = await api.get(`/messages/conversations/${selectedConversation.id}/status`, buildTenantHeaders(tenantId));
            setAiStatus(res.data);
        } catch (e) {} finally { setAiModeLoading(false); }
    };

    const handleSendTemplate = async (template: any) => {
        if (!selectedConversation) return;

        const requiredBalance = getTemplateRate(template, templateRates);
        if (walletBalance < requiredBalance) {
            toast({
                title: 'Insufficient wallet balance',
                description: `Add at least ₹${requiredBalance.toFixed(2)} to send this ${getTemplateCategory(template)} template.`,
                variant: 'destructive',
            });
            return;
        }

        const bodyComponent = template.components?.find((component: any) => component.type === 'BODY');
        const headerComponent = template.components?.find((component: any) => component.type === 'HEADER');
        const tempId = `templ-${Date.now()}`;
        const previewText = bodyComponent?.text || getTemplateDisplayName(template.name);
        
        // Optimistic UI update
        const optimisticMsg: Message = {
            id: tempId,
            direction: 'out',
            type: 'template',
            content: { body: previewText },
            status: 'sent',
            createdAt: new Date().toISOString(),
            sender: currentUser || undefined
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            setSendingTemplateId(template.id);
            const components: any[] = [];

            const headerParameters = headerComponent?.format === 'TEXT'
                ? getTemplateParameters(headerComponent.text, selectedConversation)
                : [];
            if (headerParameters.length > 0) {
                components.push({
                    type: 'header',
                    parameters: headerParameters,
                });
            }

            const bodyParameters = getTemplateParameters(bodyComponent?.text, selectedConversation);
            if (bodyParameters.length > 0) {
                components.push({
                    type: 'body',
                    parameters: bodyParameters,
                });
            }

            const res = await api.post('/messages/send', {
                to: selectedConversation.contact.phoneNumber,
                type: 'template',
                payload: {
                    name: template.name,
                    language: { code: template.language || 'en_US' },
                    ...(components.length > 0 ? { components } : {}),
                },
            }, buildTenantHeaders(tenantId));

            // Update optimistic message with real ID
            setMessages(prev => prev.map(m => m.id === tempId ? { 
                ...m, 
                id: res.data.messageId, 
                metaMessageId: res.data.metaId,
                status: 'sent',
                error: undefined 
            } : m));

            setConversations(prev => prev.map(c =>
                c.id === selectedConversation.id
                    ? {
                        ...c,
                        lastMessage: previewText,
                        lastMessageAt: new Date().toISOString(),
                        unreadCount: 0,
                    }
                    : c
            ));

            setShowQuickActions(false);
            toast({
                title: 'Template sent',
                description: `${getTemplateDisplayName(template.name)} was sent in this chat.`,
            });
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Failed to send template';
            console.error('Failed to send template from inbox', error);
            
            // Revert or mark as failed
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed', error: message } : m));
            
            toast({
                title: 'Template send failed',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setSendingTemplateId(null);
        }
    };

    const handleSendFlow = async (flow: PublishedFlow) => {
        if (!selectedConversation) return;

        const tempId = `flow-${Date.now()}`;
        const previewText = `Flow shared: ${getFlowLabel(flow)}`;
        const optimisticMsg: Message = {
            id: tempId,
            direction: 'out',
            type: 'interactive',
            content: {
                type: 'flow',
                body: { text: `Please complete ${getFlowLabel(flow)} to continue.` },
                action: {
                    name: 'flow',
                    parameters: {
                        flow_id: flow.id,
                        flow_cta: 'Open flow',
                    },
                },
            },
            status: 'sent',
            createdAt: new Date().toISOString(),
            sender: currentUser || undefined,
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        try {
            setSendingFlowId(flow.id);
            const assetsRes = await api.get(`/whatsapp/flows/${flow.id}/assets`, buildTenantHeaders(tenantId));
            const firstScreenId = assetsRes.data?.screens?.[0]?.id || 'WELCOME_SCREEN';
            const res = await api.post('/messages/send', {
                to: selectedConversation.contact.phoneNumber,
                type: 'interactive',
                payload: {
                    type: 'flow',
                    body: { text: `Please complete ${getFlowLabel(flow)} to continue.` },
                    action: {
                        name: 'flow',
                        parameters: {
                            flow_message_version: '3',
                            flow_token: `inbox_${Date.now()}`,
                            flow_id: String(flow.id),
                            flow_cta: 'Open flow',
                            flow_action: 'navigate',
                            mode: 'published',
                            flow_action_payload: {
                                screen: firstScreenId,
                            },
                        },
                    },
                },
            }, buildTenantHeaders(tenantId));

            setMessages((prev) => prev.map((message) => (
                message.id === tempId
                    ? {
                        ...message,
                        id: res.data.messageId,
                        metaMessageId: res.data.metaId,
                        status: 'sent',
                        error: undefined,
                    }
                    : message
            )));

            setConversations((prev) => prev.map((conversation) => (
                conversation.id === selectedConversation.id
                    ? {
                        ...conversation,
                        lastMessage: previewText,
                        lastMessageAt: new Date().toISOString(),
                        unreadCount: 0,
                    }
                    : conversation
            )));

            setShowQuickActions(false);
            toast({
                title: 'Flow sent',
                description: `${getFlowLabel(flow)} was shared in this chat.`,
            });
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Failed to send flow';
            setMessages((prev) => prev.map((chatMessage) => (
                chatMessage.id === tempId
                    ? { ...chatMessage, status: 'failed', error: message }
                    : chatMessage
            )));

            toast({
                title: 'Flow send failed',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setSendingFlowId(null);
        }
    };

    // --- Filter Logic ---
    const filteredConversations = useMemo(() => {
        return conversations.filter(c => {
            const normalizedQuery = deferredSearchQuery.toLowerCase();
            const matchesSearch = c.contact.name.toLowerCase().includes(normalizedQuery) || c.contact.phoneNumber.includes(deferredSearchQuery);
            const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
            const matchesAssignee = filterAssignee === 'all' || (filterAssignee === 'me' && c.assignedTo?.id === currentUser?.id) || (filterAssignee === 'unassigned' && !c.assignedTo);
            return matchesSearch && matchesStatus && matchesAssignee;
        });
    }, [conversations, deferredSearchQuery, filterStatus, filterAssignee, currentUser?.id]);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_40%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] m-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Secure Streams...</p>
                {loadingTimeout && (
                    <div className="mt-6 flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-500">
                        <p className="text-xs font-bold text-red-500">Network connection taking too long.</p>
                        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                            Refresh Session
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="m-2 sm:m-4 lg:m-6 relative flex min-h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-[24px] border border-slate-200/70 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#eef4ff_100%)] shadow-[0_24px_80px_rgba(15,23,42,0.10)] sm:rounded-[32px] lg:h-[calc(100dvh-8rem)] lg:min-h-0 lg:flex-row">
            <AnimatePresence mode="wait">
            {/* Sidebar - Conversation List */}
            <div className={clsx(
                "z-10 flex w-full flex-col border-b border-slate-200/70 bg-white/90 backdrop-blur-sm transition-all lg:w-[400px] lg:border-b-0 lg:border-r",
                selectedConversation && "hidden lg:flex"
            )}>
                <div className="border-b border-slate-100 p-4 pb-3 sm:p-6 sm:pb-4">
                    <div className="rounded-[24px] border border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:rounded-[30px] sm:px-5 sm:py-5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-[18px] shadow-lg shadow-blue-100 flex items-center justify-center">
                                <Inbox size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Inbox</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Priority Conversations</p>
                            </div>
                        </div>
                        <button onClick={() => setShowFilters(!showFilters)} className={clsx("p-3 rounded-2xl transition-all", showFilters ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}>
                            <Filter size={20} />
                        </button>
                    </div>

                    <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Open</p>
                            <p className="mt-1 text-xl font-black text-slate-900">{conversations.filter((c) => c.status === 'open').length}</p>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-500">Incoming</p>
                            <p className="mt-1 text-xl font-black text-emerald-700">{conversations.reduce((sum, c) => sum + Math.max(0, c.unreadCount || 0), 0)}</p>
                        </div>
                        <div className="rounded-2xl bg-indigo-50 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">AI Live</p>
                            <p className="mt-1 text-xl font-black text-indigo-700">{conversations.filter((c) => c.isBot).length}</p>
                        </div>
                    </div>

                    <div className="relative group mb-4">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search name or number..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] text-sm font-bold outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
                            >
                                <button
                                    onClick={() => setFilterStatus(filterStatus === 'open' ? 'all' : 'open')}
                                    className={clsx(
                                        "rounded-2xl border px-4 py-3 text-left transition-all",
                                        filterStatus === 'open' ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                                    )}
                                >
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em]">Stage</p>
                                    <p className="mt-1 text-sm font-black">{filterStatus === 'open' ? 'Showing Open' : 'Open Only'}</p>
                                </button>
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left text-slate-500 transition-all hover:border-slate-200"
                                >
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em]">Reset</p>
                                    <p className="mt-1 text-sm font-black">Show Every Thread</p>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
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
                </div>

                <div className="max-h-[40dvh] flex-1 overflow-y-auto px-3 py-3 pb-6 custom-scrollbar sm:max-h-none sm:px-4 sm:py-4 sm:pb-8">
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
                                onClick={() => handleSelectConversation(conv)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={clsx(
                "relative flex flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_40%,#f1f5f9_100%)] transition-all",
                !selectedConversation && "hidden lg:flex"
            )}>
                {selectedConversation ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                        {/* Chat Header */}
                        <div className="z-20 flex items-start justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5 lg:px-8">
                            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                <button onClick={() => handleSelectConversation(null)} className="rounded-2xl bg-slate-50 p-3 text-slate-400 lg:hidden"><ArrowLeft size={20} /></button>
                                <div className="relative">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-600 to-indigo-700 text-xl font-black text-white shadow-xl shadow-blue-100 sm:h-14 sm:w-14 sm:rounded-[22px] sm:text-2xl">
                                        {selectedConversation.contact.name.charAt(0)}
                                    </div>
                                    <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-lg shadow-sm" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="truncate text-base font-black tracking-tight text-slate-900 sm:text-lg">{selectedConversation.contact.name}</h3>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400"><Phone size={10} /> {selectedConversation.contact.phoneNumber}</span>
                                        <div className="hidden h-1 w-1 rounded-full bg-slate-200 sm:block" />
                                        {aiStatus?.windowExpired === false ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl animate-pulse border border-emerald-100/50">
                                                <Timer size={12} className="stroke-[3]" />
                                                <span className="text-[10px] font-black uppercase tracking-widest tabular-nums">
                                                    {Math.floor(aiStatus.windowSecondsLeft! / 3600)}h {Math.floor((aiStatus.windowSecondsLeft! % 3600) / 60)}m Secure
                                                </span>
                                            </div>
                                        ) : aiStatus?.windowExpired === true ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-xl border border-rose-100/50">
                                                <AlertCircle size={12} className="stroke-[3]" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Window Exhausted</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                                Live Channel
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                {aiStatus && (
                                    <div className={clsx(
                                        "hidden xl:flex items-center gap-3 rounded-2xl border px-5 py-2.5 transition-all",
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
                                <button onClick={() => setShowContactDetails(!showContactDetails)} className="rounded-2xl border border-transparent bg-slate-50 p-3 text-slate-400 shadow-sm transition-all hover:bg-slate-100"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar sm:px-6 sm:py-6 lg:p-8 xl:p-10">
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
                        <div className="z-20 border-t border-slate-200/80 bg-white/80 p-3 pt-3 backdrop-blur-xl sm:p-6 sm:pt-4 lg:p-8">
                            {/* Quick Actions */}
                            <AnimatePresence>
                                {showQuickActions && (
                                    <motion.div 
                                        ref={templatePanelRef}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 20, opacity: 0 }}
                                        className="mb-4 overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900 shadow-2xl sm:mb-6 sm:rounded-[32px]"
                                    >
                                        <div className="border-b border-white/10 px-6 py-5">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <h4 className="text-white text-xl font-black tracking-tight">Premium Message Actions</h4>
                                                    <p className="mt-1 text-sm text-slate-400">Launch approved templates or published WhatsApp flows directly from the live thread.</p>
                                                </div>
                                                <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/5 text-[10px] font-black text-white/60 uppercase tracking-widest">
                                                    Wallet: ₹{walletBalance.toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => setQuickActionTab('templates')}
                                                    className={clsx(
                                                        "rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition-all",
                                                        quickActionTab === 'templates' ? "bg-white text-slate-900" : "bg-white/5 text-slate-400 hover:bg-white/10"
                                                    )}
                                                >
                                                    <span className="inline-flex items-center gap-2"><Gem size={14} /> Templates</span>
                                                </button>
                                                <button
                                                    onClick={() => setQuickActionTab('flows')}
                                                    className={clsx(
                                                        "rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition-all",
                                                        quickActionTab === 'flows' ? "bg-white text-slate-900" : "bg-white/5 text-slate-400 hover:bg-white/10"
                                                    )}
                                                >
                                                    <span className="inline-flex items-center gap-2"><Workflow size={14} /> Flows</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="max-h-[420px] overflow-y-auto custom-scrollbar px-6 py-6">
                                            {quickActionTab === 'templates' ? (
                                                <>
                                                    {templates.length === 0 ? (
                                                        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center text-slate-400">
                                                            No approved templates are ready for quick send yet.
                                                        </div>
                                                    ) : null}
                                                    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                                                        {templates.map(t => {
                                                            const displayName = getTemplateDisplayName(t.name);
                                                            const previewText = getTemplatePreviewText(t);
                                                            const category = getTemplateCategory(t);
                                                            const rate = getTemplateRate(t, templateRates);
                                                            const canSend = walletBalance >= rate;
                                                            const isSending = sendingTemplateId === t.id;

                                                            return (
                                                                <button
                                                                    key={t.id}
                                                                    onClick={() => void handleSendTemplate(t)}
                                                                    disabled={!canSend || isSending}
                                                                    className={clsx(
                                                                        "text-left p-5 rounded-[28px] transition-all border shadow-lg",
                                                                        canSend
                                                                            ? "bg-slate-800/95 hover:bg-slate-800 border-white/10 hover:border-blue-400/30 hover:-translate-y-0.5"
                                                                            : "bg-slate-800/70 border-white/5 opacity-75 cursor-not-allowed"
                                                                    )}
                                                                >
                                                                    <div className="flex items-start justify-between gap-3 mb-4">
                                                                        <div className="min-w-0">
                                                                            <p className="text-white text-base font-semibold leading-snug break-words">
                                                                                {displayName}
                                                                            </p>
                                                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                                                <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                                                                                    {category}
                                                                                </span>
                                                                                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                                                                                    {t.language || 'en_US'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="rounded-2xl bg-white/8 px-3 py-2 text-right shrink-0">
                                                                            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Cost</p>
                                                                            <p className="text-sm font-semibold text-white">₹{rate.toFixed(2)}</p>
                                                                        </div>
                                                                    </div>

                                                                    <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-300/90">
                                                                        {previewText}
                                                                    </p>

                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                                                                            <Sparkles size={14} className="shrink-0" />
                                                                            {isSending ? 'Sending template...' : 'Send in chat'}
                                                                        </div>
                                                                        <span className={clsx(
                                                                            "text-xs",
                                                                            canSend ? "text-slate-400" : "text-amber-300"
                                                                        )}>
                                                                            {canSend ? 'Ready' : 'Low wallet balance'}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {publishedFlows.length === 0 ? (
                                                        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center text-slate-400">
                                                            No published Meta flows are available yet. Publish a flow first, then send it directly here.
                                                        </div>
                                                    ) : null}
                                                    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                                                        {publishedFlows.map((flow) => {
                                                            const isSending = sendingFlowId === flow.id;
                                                            return (
                                                                <button
                                                                    key={flow.id}
                                                                    onClick={() => void handleSendFlow(flow)}
                                                                    disabled={isSending}
                                                                    className="text-left rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(30,41,59,0.92))] p-5 shadow-lg transition-all hover:-translate-y-0.5 hover:border-cyan-400/30"
                                                                >
                                                                    <div className="mb-4 flex items-start justify-between gap-3">
                                                                        <div className="min-w-0">
                                                                            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
                                                                                <Workflow size={12} />
                                                                                Published Flow
                                                                            </div>
                                                                            <p className="mt-3 text-lg font-black text-white break-words">
                                                                                {getFlowLabel(flow)}
                                                                            </p>
                                                                        </div>
                                                                        <div className="rounded-2xl bg-white/8 px-3 py-2 text-right shrink-0">
                                                                            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Meta</p>
                                                                            <p className="text-sm font-semibold text-white">Live</p>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm leading-6 text-slate-300">
                                                                        Send a form-style CTA directly in the thread so the contact can open and complete the flow without leaving WhatsApp.
                                                                    </p>
                                                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                                                        <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                                                                            {getFlowTone(flow.categories)}
                                                                        </span>
                                                                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                                                                            Ready to launch
                                                                        </span>
                                                                    </div>
                                                                    <div className="mt-5 flex items-center justify-between gap-3">
                                                                        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                                                                            <Layers3 size={14} className="shrink-0" />
                                                                            {isSending ? 'Sending flow...' : 'Send flow in chat'}
                                                                        </div>
                                                                        <span className="text-xs text-slate-400">Customer opens inside WhatsApp</span>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:gap-5">
                                <div className="flex gap-2.5">
                                    <button 
                                        ref={templateToggleRef}
                                        onClick={() => setShowQuickActions(!showQuickActions)}
                                        className={clsx(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2",
                                            showQuickActions ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200" : "bg-slate-50 text-slate-400 border-transparent hover:border-slate-200"
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

                                <div className="relative flex-1">
                                    <div className="mb-2 flex flex-col gap-1 px-2 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                            {showQuickActions ? (quickActionTab === 'templates' ? 'Template mode active' : 'Flow mode active') : 'Live reply composer'}
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
                                            Enter to send • Shift+Enter for newline
                                        </p>
                                    </div>
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                        placeholder="Write a polished reply..."
                                        rows={1}
                                        className="max-h-40 w-full resize-none rounded-[22px] border border-slate-200 bg-white px-4 py-4 font-semibold text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-all placeholder:text-slate-300 focus:border-blue-500 focus:bg-white sm:rounded-[26px] sm:px-6 sm:py-5"
                                    />
                                </div>

                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    disabled={!inputText.trim()}
                                    className="flex h-14 w-full items-center justify-center rounded-[22px] bg-blue-600 text-white shadow-2xl shadow-blue-200 transition-all active:bg-blue-700 disabled:opacity-30 sm:w-20"
                                >
                                    <Send size={24} strokeWidth={3} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center bg-transparent p-8 text-center sm:p-12">
                        <div className="relative mb-12">
                            <div className="absolute inset-0 -z-10 rounded-[48px] bg-blue-50 blur-2xl" />
                            <div className="w-48 h-48 bg-white/90 border border-slate-200 rounded-[48px] shadow-2xl shadow-slate-100 flex items-center justify-center">
                                <MessageSquare size={80} className="text-blue-500/20" strokeWidth={1} />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Open a Conversation</h3>
                        <p className="text-slate-400 font-bold max-w-sm leading-relaxed uppercase tracking-widest text-[11px]">Pick a live thread from the left rail to respond, send templates, or launch a Meta flow directly inside WhatsApp.</p>
                    </div>
                )}
            </div>
            </AnimatePresence>

            {/* Meta Contact Details Drawer */}
            <AnimatePresence>
                {showContactDetails && selectedConversation && (
                    <motion.div 
                        initial={{ x: typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : 400, y: typeof window !== 'undefined' && window.innerWidth < 640 ? 500 : 0 }}
                        animate={{ x: 0 }}
                        exit={{ x: typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : 400, y: typeof window !== 'undefined' && window.innerWidth < 640 ? 500 : 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 top-auto z-[100] flex h-[82dvh] w-full flex-col rounded-t-[32px] border-t-2 border-slate-50 bg-white shadow-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:h-auto sm:w-[400px] sm:rounded-none sm:border-t-0 sm:border-l-2"
                    >
                        <div className="flex items-center justify-between border-b-2 border-slate-50 p-5 sm:p-8">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Lead Intelligence</h3>
                            <button onClick={() => setShowContactDetails(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400"><X size={20} strokeWidth={3} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-8 p-5 custom-scrollbar sm:space-y-12 sm:p-10">
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

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
