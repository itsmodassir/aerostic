'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { Send, Search, User } from 'lucide-react';
import { clsx } from 'clsx';

interface Conversation {
    id: string;
    contact: {
        id: string;
        name: string;
        phoneNumber: string;
    };
    lastMessageAt: string;
}

interface Message {
    id: string;
    direction: 'in' | 'out';
    type: string;
    content: any;
    status: string;
    createdAt: string;
}

export default function InboxPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [tenantId, setTenantId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Init: Get Tenant ID
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setTenantId(payload.tenantId);
            } catch (e) { console.error('Token error', e); }
        }
    }, []);

    // 2. Poll: Fetch Conversations List
    useEffect(() => {
        if (!tenantId) return;
        const fetchConvs = async () => {
            try {
                const res = await api.get(`/messages/conversations?tenantId=${tenantId}`);
                setConversations(res.data);
            } catch (e) { console.error(e); }
        };
        fetchConvs();
        const interval = setInterval(fetchConvs, 5000); // 5s poll
        return () => clearInterval(interval);
    }, [tenantId]);

    // 3. Poll: Fetch Messages for Selected Chat
    useEffect(() => {
        if (!selectedConversation || !tenantId) return;
        const fetchMsgs = async () => {
            try {
                const res = await api.get(`/messages/conversations/${selectedConversation.id}?tenantId=${tenantId}`);
                setMessages(res.data);
            } catch (e) { console.error(e); }
        };
        fetchMsgs();
        const interval = setInterval(fetchMsgs, 3000); // 3s poll
        return () => clearInterval(interval);
    }, [selectedConversation, tenantId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || !selectedConversation) return;
        try {
            await api.post('/messages/send', {
                tenantId,
                to: selectedConversation.contact.phoneNumber,
                type: 'text',
                payload: { text: inputText }
            });
            setInputText('');
            // Optimistic update or wait for poll? 
            // Let's wait for poll or manual fetch
            const res = await api.get(`/messages/conversations/${selectedConversation.id}?tenantId=${tenantId}`);
            setMessages(res.data);
        } catch (e) {
            alert('Failed to send message');
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Contact List */}
            <div className="w-80 border-r bg-gray-50 flex flex-col">
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input placeholder="Search..." className="w-full pl-9 pr-3 py-2 border rounded-md text-sm" />
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm mt-10">No active conversations</div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                className={clsx(
                                    "flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 transition-colors border-b",
                                    selectedConversation?.id === conv.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                                )}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                    <User size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 truncate">{conv.contact.name}</h4>
                                    <p className="text-xs text-gray-500">{conv.contact.phoneNumber}</p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b bg-white flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {selectedConversation.contact.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{selectedConversation.contact.name}</h3>
                                    <p className="text-xs text-gray-500">{selectedConversation.contact.phoneNumber}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-6 space-y-4">
                            {messages.map((msg) => {
                                const isOut = msg.direction === 'out';
                                return (
                                    <div key={msg.id} className={clsx("flex", isOut ? "justify-end" : "justify-start")}>
                                        <div className={clsx(
                                            "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm text-sm",
                                            isOut
                                                ? "bg-blue-600 text-white rounded-br-none"
                                                : "bg-white text-gray-800 rounded-bl-none border"
                                        )}>
                                            {msg.type === 'text' && <p>{msg.content.body}</p>}
                                            {/* Stub for other types */}
                                            <div className={clsx("text-[10px] mt-1 text-right opacity-70", isOut ? "text-blue-100" : "text-gray-400")}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button
                                    onClick={handleSend}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <User size={64} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
