'use client';

import { useState, useEffect } from 'react';
import { Database, Table, Search, ChevronLeft, ChevronRight, Loader2, RefreshCw, AlertCircle, FileJson } from 'lucide-react';

export default function DatabaseExplorerPage() {
    const [tables, setTables] = useState<string[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<any>(null);
    const [loadingTables, setLoadingTables] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [page, setPage] = useState(1);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTables();
    }, []);

    useEffect(() => {
        if (selectedTable) {
            fetchTableData(selectedTable, 1);
        }
    }, [selectedTable]);

    const fetchTables = async () => {
        try {
            setLoadingTables(true);
            const res = await fetch('/api/admin/database/tables', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch tables');
            const data = await res.json();
            setTables(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingTables(false);
        }
    };

    const fetchTableData = async (tableName: string, pageNum: number) => {
        try {
            setLoadingData(true);
            const res = await fetch(`/api/admin/database/tables/${tableName}?page=${pageNum}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch table data');
            const data = await res.json();
            setTableData(data);
            setPage(pageNum);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingData(false);
        }
    };

    if (loadingTables) return (
        <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="animate-spin text-blue-600 w-12 h-12 mb-4" />
            <p className="text-gray-500 animate-pulse">Scanning database schema...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Database Explorer</h1>
                    <p className="text-gray-600 mt-1">Direct view into all platform tables</p>
                </div>
                <button
                    onClick={fetchTables}
                    className="p-2 hover:bg-white rounded-lg border border-gray-200 text-gray-500 transition-all shadow-sm"
                    title="Refresh Schema"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-4 gap-6">
                {/* Tables List */}
                <div className="col-span-1 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-[calc(100vh-250px)] flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2 text-gray-900 font-bold mb-4">
                            <Table className="w-5 h-5 text-blue-600" />
                            <span>System Tables</span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tables..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {tables.map(table => (
                            <button
                                key={table}
                                onClick={() => setSelectedTable(table)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 ${selectedTable === table
                                        ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-200'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${selectedTable === table ? 'bg-white' : 'bg-gray-300'}`} />
                                {table}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data View */}
                <div className="col-span-3 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-[calc(100vh-250px)] flex flex-col">
                    {!selectedTable ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12">
                            <Database className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a table to browse data</p>
                            <p className="text-sm">Only the primary public schema is accessible here</p>
                        </div>
                    ) : (
                        <>
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-lg font-bold text-gray-900">{selectedTable}</h2>
                                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                        {tableData?.total || 0} Rows
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 mr-2">
                                        Page {page} of {Math.ceil((tableData?.total || 1) / (tableData?.limit || 1))}
                                    </span>
                                    <button
                                        disabled={page === 1 || loadingData}
                                        onClick={() => fetchTableData(selectedTable, page - 1)}
                                        className="p-1.5 hover:bg-white rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        disabled={page >= Math.ceil((tableData?.total || 1) / (tableData?.limit || 1)) || loadingData}
                                        onClick={() => fetchTableData(selectedTable, page + 1)}
                                        className="p-1.5 hover:bg-white rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {loadingData ? (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <Loader2 className="animate-spin text-blue-600 w-8 h-8 mb-2" />
                                    <p className="text-sm text-gray-500">Querying entries...</p>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                {tableData?.columns?.map((col: any) => (
                                                    <th key={col.column_name} className="px-4 py-3 text-left font-bold text-gray-700 whitespace-nowrap border-b border-gray-200">
                                                        <div className="flex flex-col">
                                                            <span>{col.column_name}</span>
                                                            <span className="text-[10px] text-gray-400 font-normal uppercase">{col.data_type}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {tableData?.data?.map((row: any, i: number) => (
                                                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                                    {tableData.columns.map((col: any) => (
                                                        <td key={col.column_name} className="px-4 py-3 text-gray-600 max-w-[300px] truncate">
                                                            {row[col.column_name] === null ? (
                                                                <span className="text-gray-300 italic">null</span>
                                                            ) : typeof row[col.column_name] === 'object' ? (
                                                                <div className="flex items-center gap-1.5 text-blue-500 font-medium">
                                                                    <FileJson className="w-3.5 h-3.5" />
                                                                    <span>JSON Object</span>
                                                                </div>
                                                            ) : (
                                                                String(row[col.column_name])
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

