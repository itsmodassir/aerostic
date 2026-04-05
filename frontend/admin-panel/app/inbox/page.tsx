'use client';

import { useState, useEffect } from 'react';
import {
    Mail,
    Send,
    Archive,
    Trash2,
    RefreshCw,
    Search,
    User,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Filter,
    Inbox,
    Star,
    AlertOctagon,
    Plus,
    X
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/lib/api';

const MAILBOXES = [
    { id: 'support', name: 'Support', email: 'support@aimstore.in', color: 'bg-blue-500' },
    { id: 'sales', name: 'Sales', email: 'sales@aimstore.in', color: 'bg-green-500' },
    { id: 'contact', name: 'Contact', email: 'contact@aimstore.in', color: 'bg-purple-500' },
    { id: 'info', name: 'Info', email: 'info@aimstore.in', color: 'bg-orange-500' },
    { id: 'customer', name: 'Customer', email: 'customer@aimstore.in', color: 'bg-indigo-500' },
];

const FOLDERS = [
    { id: 'inbox', name: 'Inbox', icon: <Inbox className="w-4 h-4" /> },
    { id: 'sent', name: 'Sent', icon: <Send className="w-4 h-4" /> },
    { id: 'archive', name: 'Archive', icon: <Archive className="w-4 h-4" /> },
    { id: 'spam', name: 'Spam', icon: <AlertOctagon className="w-4 h-4" /> },
];

export default function AdminInboxPage() {
    const [activeMailbox, setActiveMailbox] = useState('support');
    const [activeFolder, setActiveFolder] = useState('inbox');
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCompose, setShowCompose] = useState(false);

    // Filter messages based on search
    const filteredMessages = messages.filter(m =>
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.from.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/inbox/messages', {
                params: { mailbox: activeMailbox, folder: activeFolder }
            });
            setMessages(res.data);
            if (res.data.length > 0 && !selectedMessage) {
                // setSelectedMessage(res.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [activeMailbox, activeFolder]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/admin/inbox/messages/${id}/read`);
            setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, isRead: true });
            }
        } catch (error) {
            console.error('Failed to mark as read');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/admin/inbox/messages/${id}`);
            setMessages(messages.filter(m => m.id !== id));
            if (selectedMessage?.id === id) {
                setSelectedMessage(null);
            }
        } catch (error) {
            console.error('Failed to delete message');
        }
    };

    const handleSelectMessage = (msg: any) => {
        setSelectedMessage(msg);
        if (!msg.isRead) {
            handleMarkAsRead(msg.id);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Top Toolbar */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowCompose(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        Compose
                    </button>
                    <button
                        onClick={fetchMessages}
                        className="p-2 text-gray-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200"
                    >
                        <RefreshCw className={clsx("w-5 h-5", loading && "animate-spin")} />
                    </button>
                </div>

                <div className="flex-1 max-w-md mx-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search in conversation..."
                            className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-500">
                        {filteredMessages.length} Messages
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Mailboxes Sidebar */}
                <div className="w-64 border-r flex flex-col bg-gray-50/30">
                    <div className="p-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Mailboxes</h3>
                        <div className="space-y-1">
                            {MAILBOXES.map((mb) => (
                                <button
                                    key={mb.id}
                                    onClick={() => setActiveMailbox(mb.id)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                        activeMailbox === mb.id
                                            ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                                    )}
                                >
                                    <div className={clsx("w-2 h-2 rounded-full", mb.color)} />
                                    <span className="flex-1 text-left">{mb.name}</span>
                                    {/* {mb.unread > 0 && (
                                        <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                            {mb.unread}
                                        </span>
                                    )} */}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 border-t">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Folders</h3>
                        <div className="space-y-1">
                            {FOLDERS.map((folder) => (
                                <button
                                    key={folder.id}
                                    onClick={() => setActiveFolder(folder.id)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                        activeFolder === folder.id
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                                    )}
                                >
                                    {folder.icon}
                                    <span>{folder.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Message List */}
                <div className="w-96 border-r flex flex-col bg-white overflow-y-auto">
                    {loading && messages.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 opacity-20" />
                            <p className="text-sm">Loading messages...</p>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <Mail className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p className="text-sm">No messages found</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <button
                                key={msg.id}
                                onClick={() => handleSelectMessage(msg)}
                                className={clsx(
                                    "p-6 border-b text-left hover:bg-gray-50 transition-colors relative group",
                                    selectedMessage?.id === msg.id ? "bg-blue-50/30" : "bg-white",
                                    !msg.isRead && "font-bold"
                                )}
                            >
                                {!msg.isRead && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                )}
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                            {msg.from[0]?.toUpperCase()}
                                        </div>
                                        <span className="text-sm text-gray-900 truncate max-w-[140px]">
                                            {msg.from}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <h4 className="text-sm text-gray-900 mb-1 truncate">{msg.subject}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                    {msg.content}
                                </p>
                            </button>
                        ))
                    )}
                </div>

                {/* Message Detail */}
                <div className="flex-1 bg-gray-50/20 flex flex-col h-full overflow-hidden">
                    {selectedMessage ? (
                        <>
                            <div className="p-8 bg-white border-b">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h2>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                                                {selectedMessage.from[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{selectedMessage.from}</p>
                                                <p className="text-xs text-gray-500">to {selectedMessage.to}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDelete(selectedMessage.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Archive">
                                            <Archive className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 p-8 overflow-y-auto bg-white">
                                <div className="max-w-3xl mx-auto">
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-8 border-b pb-4">
                                        <Clock className="w-3.5 h-3.5" />
                                        Sent on {new Date(selectedMessage.createdAt).toLocaleString()}
                                    </div>
                                    <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                                        {selectedMessage.content}
                                    </div>

                                    {/* Reply Section */}
                                    <div className="mt-12 pt-12 border-t">
                                        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Send className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-bold text-gray-700">Quick Reply</span>
                                            </div>
                                            <textarea
                                                className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px]"
                                                placeholder="Write your response..."
                                            />
                                            <div className="flex justify-end mt-4">
                                                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
                                                    Send Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50/50">
                            <div className="text-center max-w-sm">
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                                    <Mail className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Message</h3>
                                <p className="text-gray-500 text-sm"> Choose a conversation from the list to view its details and reply.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Compose Modal (Simplified) */}
            {showCompose && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">New Message</h3>
                            <button onClick={() => setShowCompose(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">From</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500">
                                    {MAILBOXES.map(mb => <option key={mb.id} value={mb.id}>{mb.name} ({mb.email})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">To</label>
                                <input type="email" placeholder="recipient@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</label>
                                <input type="text" placeholder="Message subject" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Content</label>
                                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500 min-h-[200px]" placeholder="Type your message here..." />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
                            <button onClick={() => setShowCompose(false)} className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                            <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

