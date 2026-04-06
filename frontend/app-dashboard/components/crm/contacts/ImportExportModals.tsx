import React, { useState } from 'react';
import { 
    X, Upload, Download, FileText, 
    AlertCircle, CheckCircle2, Loader2,
    History, MapPin, Phone, User
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/lib/api';

interface ImportExportModalsProps {
    type: 'import' | 'export' | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ImportExportModals({ type, onClose, onSuccess }: ImportExportModalsProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/contacts/import', formData);
            setResults(res.data);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Import failed');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            const res = await api.get('/contacts/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'contacts_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            onClose();
        } catch (err) {
            setError('Export failed');
        } finally {
            setLoading(false);
        }
    };

    if (!type) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl relative border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className={clsx(
                            "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm",
                            type === 'import' ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                        )}>
                            {type === 'import' ? <Upload size={24} /> : <Download size={24} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight capitalize">{type} Contacts</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Bulk CRM Operations</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100 rounded-2xl transition-colors border border-gray-200 text-gray-400 hover:text-black"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {type === 'import' ? (
                        results ? (
                            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[32px] flex flex-col items-center gap-4 text-center">
                                    <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-emerald-900">Import Successful!</p>
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Status: Processed {results.imported + results.updated} contacts</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">New Imported</p>
                                        <p className="text-3xl font-black text-gray-900">{results.imported}</p>
                                    </div>
                                    <div className="p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Existing Updated</p>
                                        <p className="text-3xl font-black text-gray-900">{results.updated}</p>
                                    </div>
                                </div>

                                {results.errors?.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Issues ({results.errors.length})</p>
                                        <div className="max-h-32 overflow-y-auto p-4 bg-red-50 border border-red-100 rounded-2xl text-[11px] text-red-600 font-bold space-y-1">
                                            {results.errors.map((err: string, i: number) => (
                                                <div key={i} className="flex gap-2">
                                                    <span>•</span> {err}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={onClose}
                                    className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all active:scale-95"
                                >
                                    Return to List
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleImport} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <FileText size={14} /> CSV Data Component
                                    </label>
                                    <div 
                                        className={clsx(
                                            "border-4 border-dashed rounded-[40px] p-12 flex flex-col items-center gap-4 transition-all relative group",
                                            file ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-100 hover:border-blue-300 hover:bg-blue-50/10"
                                        )}
                                    >
                                        <input 
                                            type="file" 
                                            onChange={handleFileChange} 
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept=".csv"
                                        />
                                        <div className={clsx(
                                            "w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                            file ? "bg-emerald-600 text-white shadow-emerald-100" : "bg-white text-gray-300 shadow-gray-100"
                                        )}>
                                            <Upload size={32} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black text-gray-900 tracking-tight">
                                                {file ? file.name : "Drop CSV file here"}
                                            </p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                {file ? `${(file.size / 1024).toFixed(1)} KB` : "Max file size: 10MB"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-[32px] space-y-3">
                                    <div className="flex items-center gap-3 text-blue-700">
                                        <AlertCircle size={18} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">CSV Requirements</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm">P</div>
                                            <span className="text-[11px] font-bold tracking-tight">phone (Required)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-blue-600 opacity-60">
                                            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm">N</div>
                                            <span className="text-[11px] font-bold tracking-tight">name (Optional)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-blue-600 opacity-60">
                                            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm">G</div>
                                            <span className="text-[11px] font-bold tracking-tight">groups (Optional)</span>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                                        <AlertCircle size={18} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                                    </div>
                                )}

                                <button 
                                    type="submit"
                                    disabled={!file || loading}
                                    className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-200 hover:bg-emerald-600 transition-all active:scale-95 disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                    Begin Data Synchronization
                                </button>
                            </form>
                        )
                    ) : (
                        <div className="space-y-8 py-4">
                            <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[40px] flex flex-col items-center gap-6 text-center">
                                <div className="w-20 h-20 bg-emerald-600 text-white rounded-[32px] flex items-center justify-center shadow-xl shadow-emerald-100">
                                    <Download size={40} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-emerald-900 tracking-tight">Export Ready</p>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Generate universal CSV snapshot</p>
                                </div>
                                <div className="w-full flex items-center gap-2 p-6 bg-white rounded-3xl border border-emerald-100">
                                    <ul className="text-left space-y-2 w-full">
                                        <li className="flex items-center gap-3 text-[11px] font-bold text-gray-600">
                                            <CheckCircle2 size={16} className="text-emerald-500" /> Full Phone Number History
                                        </li>
                                        <li className="flex items-center gap-3 text-[11px] font-bold text-gray-600">
                                            <CheckCircle2 size={16} className="text-emerald-500" /> Groups & Tagging Metrics
                                        </li>
                                        <li className="flex items-center gap-3 text-[11px] font-bold text-gray-600">
                                            <CheckCircle2 size={16} className="text-emerald-500" /> VIP & Loyalty Status Indicators
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                                    <AlertCircle size={18} />
                                    <p className="text-[10px] font-black uppercase tracking-widest font-black uppercase tracking-widest">{error}</p>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={onClose}
                                    className="px-8 py-5 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-black transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleExport}
                                    disabled={loading}
                                    className="flex-1 py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-200 hover:bg-emerald-600 transition-all active:scale-95 disabled:bg-gray-400 flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                    Download CSV Hub
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
