'use client';

import { useState, useEffect } from 'react';
import {
    MessageSquare, Search, Filter, Download, Calendar, ChevronDown,
    CheckCircle, XCircle, Clock, Eye, MoreVertical, Loader2
} from 'lucide-react';

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState('all');

    useEffect(() => {
        fetchMessages();
    }, [page, search]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/messages?page=${page}&search=${search}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setMessages(data.data || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Message Logs</h1>
                    <p className="text-gray-500">Monitor all messages across tenants</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchMessages}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Refresh"
                    >
                        <Clock className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, tenant, or recipient..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                </div>
            </div>

            {/* Messages Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                            <th className="px-6 py-4">Message ID</th>
                            <th className="px-6 py-4">Tenant</th>
                            <th className="px-6 py-4">To</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                                </td>
                            </tr>
                        ) : messages.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No messages found
                                </td>
                            </tr>
                        ) : (
                            messages.map((msg) => (
                                <tr key={msg.id} className="text-sm hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-gray-600">{msg.id.substring(0, 8)}...</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{msg.tenant}</td>
                                    <td className="px-6 py-4 font-mono text-gray-600 text-xs">{msg.to}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700`}>
                                            {msg.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${msg.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                                            msg.status === 'read' ? 'bg-green-100 text-green-700' :
                                                msg.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                            }`}>
                                            {msg.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

