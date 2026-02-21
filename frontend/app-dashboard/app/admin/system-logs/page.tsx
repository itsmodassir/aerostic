'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Clock, AlertCircle, CheckCircle, Info, AlertTriangle, ChevronDown, ChevronUp, Calendar, X } from 'lucide-react';

interface Log {
    id: string;
    actorId: string;
    actorName: string;
    action: string;
    target: string;
    metadata: any;
    ipAddress: string;
    level: 'info' | 'success' | 'warning' | 'error';
    category: 'system' | 'user' | 'security' | 'billing' | 'whatsapp' | 'ai';
    source: string;
    timestamp: string;
}

interface LogStats {
    info: number;
    success: number;
    warning: number;
    error: number;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [stats, setStats] = useState<LogStats>({ info: 0, success: 0, warning: 0, error: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [showFilters, setShowFilters] = useState(false);



    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [currentPage, levelFilter, categoryFilter, searchTerm]);

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchLogs();
                fetchStats();
            }, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh, currentPage, levelFilter, categoryFilter, searchTerm]);

    const fetchLogs = async () => {
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20',
            });

            if (levelFilter !== 'all') params.append('level', levelFilter);
            if (categoryFilter !== 'all') params.append('category', categoryFilter);
            if (searchTerm) params.append('search', searchTerm);

            const res = await fetch(`/api/v1/admin/platform/audit-logs?${params}`, {
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : (data.data || []);
                setLogs(list);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotal(Array.isArray(data) ? data.length : (data.pagination?.total || list.length));
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`/api/v1/admin/platform/audit-logs?limit=1000`, {
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                // Compute stats from the full list if no dedicated endpoint
                const list: any[] = Array.isArray(data) ? data : (data.data || []);
                const computed = { info: 0, success: 0, warning: 0, error: 0 };
                list.forEach((l: any) => {
                    const lvl = (l.level || 'info').toLowerCase();
                    if (lvl in computed) (computed as any)[lvl]++;
                });
                setStats(computed);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const getRelativeTime = (timestamp: string) => {
        const now = new Date();
        const logTime = new Date(timestamp);
        const diffMs = now.getTime() - logTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error': return <AlertCircle className="w-4 h-4" />;
            case 'warning': return <AlertTriangle className="w-4 h-4" />;
            case 'success': return <CheckCircle className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const getLevelStyles = (level: string) => {
        switch (level) {
            case 'error': return 'bg-red-100 text-red-700 border-red-200';
            case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'success': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    const getCategoryBadgeColor = (category: string) => {
        switch (category) {
            case 'security': return 'bg-purple-100 text-purple-700';
            case 'billing': return 'bg-emerald-100 text-emerald-700';
            case 'whatsapp': return 'bg-green-100 text-green-700';
            case 'ai': return 'bg-pink-100 text-pink-700';
            case 'user': return 'bg-indigo-100 text-indigo-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleExport = (format: 'csv' | 'json') => {
        if (format === 'json') {
            const dataStr = JSON.stringify(logs, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `logs-${new Date().toISOString()}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        } else {
            // CSV export
            const headers = ['Timestamp', 'Level', 'Category', 'Actor', 'Action', 'Target', 'IP Address'];
            const csvContent = [
                headers.join(','),
                ...logs.map(log => [
                    new Date(log.timestamp).toLocaleString(),
                    log.level,
                    log.category,
                    log.actorName,
                    log.action,
                    log.target,
                    log.ipAddress || ''
                ].join(','))
            ].join('\n');

            const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
            const exportFileDefaultName = `logs-${new Date().toISOString()}.csv`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setLevelFilter('all');
        setCategoryFilter('all');
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
                    <p className="text-gray-500 mt-1">Monitor all system activities and events in real-time</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${autoRefresh
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                        Auto-refresh
                    </button>
                    <button
                        onClick={() => { fetchLogs(); fetchStats(); }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        {showFilters && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                                <button
                                    onClick={() => { handleExport('csv'); setShowFilters(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Export as CSV
                                </button>
                                <button
                                    onClick={() => { handleExport('json'); setShowFilters(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Export as JSON
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600">Info</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.info}</p>
                        </div>
                        <Info className="w-8 h-8 text-blue-600 opacity-50" />
                    </div>
                    <p className="text-xs text-blue-600 mt-2">Last 24 hours</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600">Success</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">{stats.success}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
                    </div>
                    <p className="text-xs text-green-600 mt-2">Last 24 hours</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-600">Warnings</p>
                            <p className="text-2xl font-bold text-amber-900 mt-1">{stats.warning}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-amber-600 opacity-50" />
                    </div>
                    <p className="text-xs text-amber-600 mt-2">Last 24 hours</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600">Errors</p>
                            <p className="text-2xl font-bold text-red-900 mt-1">{stats.error}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-600 opacity-50" />
                    </div>
                    <p className="text-xs text-red-600 mt-2">Last 24 hours</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={levelFilter}
                        onChange={(e) => { setLevelFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Levels</option>
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Categories</option>
                        <option value="system">System</option>
                        <option value="user">User</option>
                        <option value="security">Security</option>
                        <option value="billing">Billing</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="ai">AI</option>
                    </select>

                    {(searchTerm || levelFilter !== 'all' || categoryFilter !== 'all') && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}

                    <div className="text-sm text-gray-500">
                        {total} log{total !== 1 ? 's' : ''} found
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">Level</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Actor</th>
                                <th className="px-6 py-3">Action</th>
                                <th className="px-6 py-3">Target</th>
                                <th className="px-6 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {logs.length > 0 ? logs.map((log) => (
                                <>
                                    <tr
                                        key={log.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <div className="text-gray-900 font-medium">{getRelativeTime(log.timestamp)}</div>
                                                    <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getLevelStyles(log.level)}`}>
                                                {getLevelIcon(log.level)}
                                                {log.level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(log.category)}`}>
                                                {log.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {log.actorName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{log.actorName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-mono">{log.action}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 max-w-xs truncate">{log.target}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {expandedLog === log.id ? (
                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            )}
                                        </td>
                                    </tr>
                                    {expandedLog === log.id && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 bg-gray-50">
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 uppercase">Log ID</p>
                                                            <p className="text-sm text-gray-900 font-mono mt-1">{log.id}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 uppercase">IP Address</p>
                                                            <p className="text-sm text-gray-900 font-mono mt-1">{log.ipAddress || 'N/A'}</p>
                                                        </div>
                                                        {log.source && (
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 uppercase">Source</p>
                                                                <p className="text-sm text-gray-900 font-mono mt-1">{log.source}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Metadata</p>
                                                            <pre className="bg-white rounded-lg p-3 text-xs overflow-x-auto border border-gray-200">
                                                                {JSON.stringify(log.metadata, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Filter className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">No logs found</p>
                                            <p className="text-sm mt-1">Try adjusting your filters or search term</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
