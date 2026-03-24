"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Send, Copy, AlertCircle, FileSpreadsheet, Users, UserCheck, ChevronRight, ChevronLeft, Upload, Megaphone, BarChart3, Wallet, X, CheckCircle2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { clsx } from 'clsx';
import Papa from 'papaparse';

interface Campaign {
    id: string;
    name: string;
    status: string;
    sentCount: number;
    failedCount: number;
    deliveredCount: number;
    readCount: number;
    totalCost: number;
    totalContacts: number;
    createdAt: string;
    recipientType: string;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [tenantId, setTenantId] = useState<string>('');
    const params = useParams();

    const [templates, setTemplates] = useState<any[]>([]);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [templateRate, setTemplateRate] = useState<number>(0.80);
    const [totalContactsCount, setTotalContactsCount] = useState<number>(0);

    // Wizard State
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        templateName: '',
        templateLanguage: 'en_US',
        recipientType: 'ALL', // ALL, CSV, MANUAL
        recipients: [] as any[] // { name, phoneNumber }
    });

    const [csvPreview, setCsvPreview] = useState<any[]>([]);
    const [manualInput, setManualInput] = useState('');

    useEffect(() => {
        const initTenant = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug) return;
            try {
                const res = await api.get('/auth/workspaces');
                const memberships = res.data;
                const activeMembership = memberships.find((m: any) => 
                    m.tenant?.slug === workspaceSlug || m.tenant?.id === workspaceSlug
                );
                if (activeMembership && activeMembership.tenant?.id) {
                    const tid = activeMembership.tenant.id;
                    setTenantId(tid);
                    fetchCampaigns(tid);
                    fetchTemplates(tid);
                    fetchWalletAndContacts(tid);
                }
            } catch (e) {
                console.error('Failed to resolve tenant');
            }
        };
        initTenant();
    }, [params.workspaceId]);

    const fetchWalletAndContacts = async (tid: string) => {
        try {
            const [walletRes, contactsRes] = await Promise.all([
                api.get(`/billing/wallet/balance?tenantId=${tid}`),
                api.get(`/contacts?tenantId=${tid}`)
            ]);
            setWalletBalance(walletRes.data.balance || 0);
            if (walletRes.data.templateRate !== undefined) {
                setTemplateRate(walletRes.data.templateRate);
            }
            setTotalContactsCount(contactsRes.data.length || 0);
        } catch (e) {
            console.error('Failed to load wallet or contacts');
        }
    };

    const fetchTemplates = async (tid: string) => {
        try {
            const res = await api.get(`/templates?tenantId=${tid}`);
            setTemplates(res.data.filter((t: any) => 
                t.status?.toUpperCase() === 'APPROVED'
            ));
        } catch (e) { console.error('Failed to load templates'); }
    };

    const fetchCampaigns = async (tid: string) => {
        try {
            const res = await api.get(`/campaigns?tenantId=${tid}`);
            setCampaigns(res.data);
        } catch (error) { console.error('Failed to fetch campaigns', error); }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                const validRows = results.data.map((row: any) => ({
                    name: row.name || row.Name || 'Valued Customer',
                    phoneNumber: row.phone || row.Phone || row.mobile || row.Mobile || ''
                })).filter((r: any) => r.phoneNumber);

                setCsvPreview(validRows.slice(0, 3)); 
                setFormData({ ...formData, recipients: validRows });
            }
        });
    };

    const handleManualProcess = () => {
        const rows = manualInput.split('\n').filter(r => r.trim());
        const processed = rows.map(r => {
            const [phone, name] = r.split(',').map(s => s.trim());
            return { phoneNumber: phone, name: name || 'Valued Customer' };
        }).filter(r => r.phoneNumber);
        setFormData({ ...formData, recipients: processed });
    };

    const handleLaunch = async () => {
        setLoading(true);
        try {
            const createRes = await api.post('/campaigns', {
                tenantId,
                name: formData.name,
                templateName: formData.templateName,
                templateLanguage: formData.templateLanguage,
                recipientType: formData.recipientType,
                recipients: formData.recipientType !== 'ALL' ? formData.recipients : []
            });
            const campaignId = createRes.data.id;
            await api.post(`/campaigns/${campaignId}/send`, { tenantId });
            setShowModal(false);
            setFormData({
                name: '', templateName: '', templateLanguage: 'en_US',
                recipientType: 'ALL', recipients: []
            });
            setStep(1);
            fetchCampaigns(tenantId);
        } catch (error: any) {
            alert('Launch failed');
        } finally {
            setLoading(false);
        }
    };

    const estimatedContacts = formData.recipientType === 'ALL' ? totalContactsCount : formData.recipients.length;
    const estimatedCost = estimatedContacts * templateRate;
    const canLaunch = walletBalance >= estimatedCost;

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Megaphone className="text-indigo-600" size={32} />
                        Campaigns
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Broadcast messages to your audience at scale</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-sm shadow-xl shadow-indigo-100"
                    >
                        <Plus size={18} /> New Broadcast
                    </button>
                </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-3xl border-2 border-gray-50 shadow-sm">
                    <div className="text-2xl font-black text-gray-900">{campaigns.length}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Campaigns</div>
                </div>
                <div className="bg-white p-4 rounded-3xl border-2 border-gray-50 shadow-sm">
                    <div className="text-2xl font-black text-indigo-600">₹{walletBalance.toFixed(2)}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wallet Balance</div>
                </div>
                <div className="bg-white p-4 rounded-3xl border-2 border-gray-50 shadow-sm">
                    <div className="text-2xl font-black text-green-600">{campaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0)}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Delivered</div>
                </div>
                <div className="bg-white p-4 rounded-3xl border-2 border-gray-50 shadow-sm">
                    <div className="text-2xl font-black text-blue-600">{campaigns.reduce((acc, c) => acc + (c.readCount || 0), 0)}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Reads</div>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="space-y-4">
                {campaigns.length === 0 ? (
                    <div className="py-20 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                        <Megaphone className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-black text-gray-900">No campaigns yet</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">Start your first broadcast campaign to reach your customers on WhatsApp.</p>
                    </div>
                ) : (
                    campaigns.map((camp) => (
                        <div key={camp.id} className="bg-white p-5 sm:p-6 rounded-[32px] border-2 border-gray-50 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group">
                            <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                                {/* Left Section: Name & Status */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-black text-gray-900 text-lg leading-tight">{camp.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${camp.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>{camp.status}</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">{camp.recipientType || 'ALL'}</span>
                                            </div>
                                        </div>
                                        <div className="lg:hidden text-right">
                                            <div className="text-lg font-black text-gray-900">{camp.totalContacts || 0}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Targeted</div>
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-gray-400 font-medium italic">
                                        Launched on {new Date(camp.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {/* Right Section: Stats Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8 lg:border-l lg:pl-8 border-gray-100">
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-green-600 flex items-center gap-1.5">
                                            {((camp.deliveredCount || 0) / Math.max(camp.totalContacts || 1, 1) * 100).toFixed(0)}%
                                            <BarChart3 size={12} />
                                        </div>
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Delivered</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-blue-600 flex items-center gap-1.5">
                                            {((camp.readCount || 0) / Math.max(camp.totalContacts || 1, 1) * 100).toFixed(0)}%
                                            <CheckCircle2 size={12} />
                                        </div>
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Read Rate</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-red-500">{camp.failedCount || 0}</div>
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Failed</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-gray-900">₹{Number(camp.totalCost || 0).toFixed(2)}</div>
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Spend</div>
                                    </div>
                                </div>

                                {/* Desktop only targeted count */}
                                <div className="hidden lg:block text-right border-l pl-8 border-gray-100">
                                    <div className="text-2xl font-black text-gray-900">{camp.totalContacts || 0}</div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Targeted</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Campaign Wizard Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-xl bg-white sm:rounded-[40px] rounded-t-[40px] shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">New Broadcast</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    {[1, 2, 3].map(s => (
                                        <div key={s} className={clsx("h-1 rounded-full transition-all", s === step ? "w-8 bg-indigo-600" : s < step ? "w-4 bg-green-500" : "w-4 bg-gray-200")} />
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"><X size={20} /></button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 sm:p-10 overflow-y-auto flex-1 space-y-8">
                            
                            {step === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-black text-gray-700 ml-1">Campaign Name</label>
                                        <input
                                            required
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                            placeholder="e.g. Summer Flash Sale"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-black text-gray-700 ml-1">Select Template</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-bold text-gray-900 appearance-none"
                                                required
                                                value={formData.templateName}
                                                onChange={(e) => {
                                                    const t = templates.find(temp => temp.name === e.target.value);
                                                    setFormData({
                                                        ...formData,
                                                        templateName: e.target.value,
                                                        templateLanguage: t?.language || 'en_US'
                                                    });
                                                }}
                                            >
                                                <option value="" disabled>Choose an approved template...</option>
                                                {templates.map(t => (
                                                    <option key={t.id} value={t.name}>{t.name} ({t.language})</option>
                                                ))}
                                            </select>
                                            <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={18} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex p-1.5 bg-gray-100 rounded-2xl">
                                        {['ALL', 'CSV', 'MANUAL'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, recipientType: type })}
                                                className={clsx(
                                                    "flex-1 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-widest",
                                                    formData.recipientType === type ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                                )}
                                            >
                                                {type === 'ALL' ? 'Audience' : type}
                                            </button>
                                        ))}
                                    </div>

                                    {formData.recipientType === 'ALL' && (
                                        <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 flex gap-4 items-start">
                                            <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><Users size={24} /></div>
                                            <div>
                                                <h4 className="font-black text-indigo-900 text-sm">Target Entire Audience</h4>
                                                <p className="text-xs text-indigo-700/70 mt-1 font-medium leading-relaxed">This campaign will be broadcasted to all <strong>{totalContactsCount}</strong> contacts in your database.</p>
                                            </div>
                                        </div>
                                    )}

                                    {formData.recipientType === 'CSV' && (
                                        <div className="space-y-4">
                                            <div className="border-2 border-dashed border-gray-200 rounded-[32px] p-10 text-center hover:bg-gray-50/50 hover:border-indigo-300 transition-all cursor-pointer group relative">
                                                <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    <Upload size={32} className="text-gray-400 group-hover:text-indigo-500" />
                                                </div>
                                                <h4 className="font-black text-gray-900">Upload CSV File</h4>
                                                <p className="text-xs text-gray-400 mt-1 font-medium">Headers required: phone, name (opt)</p>
                                            </div>
                                            {csvPreview.length > 0 && (
                                                <div className="bg-gray-50 rounded-2xl border-2 border-gray-100 p-4">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preview ({formData.recipients.length} total)</span>
                                                        <CheckCircle2 size={14} className="text-green-500" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        {csvPreview.map((r, i) => (
                                                            <div key={i} className="flex justify-between text-xs font-bold bg-white p-2 rounded-lg border border-gray-100">
                                                                <span className="text-gray-900">{r.name}</span>
                                                                <span className="text-gray-400">{r.phoneNumber}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {formData.recipientType === 'MANUAL' && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-sm font-black text-gray-700">Manual Entry</label>
                                                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{formData.recipients.length} Valid</span>
                                            </div>
                                            <textarea
                                                className="w-full h-40 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-3xl p-5 outline-none transition-all font-mono text-xs leading-relaxed"
                                                placeholder="919876543210, John Doe&#10;919988776655, Jane Smith"
                                                value={manualInput}
                                                onChange={(e) => setManualInput(e.target.value)}
                                                onBlur={handleManualProcess}
                                            />
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1">Format: phone, name (one per line)</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-200">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Ready to Launch</h4>
                                                <p className="text-2xl font-black mt-1 leading-tight">{formData.name}</p>
                                            </div>
                                            <Megaphone size={32} className="opacity-40" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Recipients</p>
                                                <p className="text-xl font-black">{estimatedContacts}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Est. Cost</p>
                                                <p className="text-xl font-black">₹{estimatedCost.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gray-50 rounded-[32px] border-2 border-gray-100 space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2 font-black text-gray-400 uppercase tracking-widest text-[10px]">
                                                <Wallet size={14} /> Wallet Balance
                                            </div>
                                            <span className={clsx("font-black", canLaunch ? "text-green-600" : "text-red-500")}>₹{walletBalance.toFixed(2)}</span>
                                        </div>
                                        {!canLaunch && (
                                            <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex gap-3">
                                                <AlertCircle className="text-red-500 shrink-0" size={18} />
                                                <p className="text-xs font-bold text-red-800 leading-relaxed">Insufficient balance. You need ₹{(estimatedCost - walletBalance).toFixed(2)} more to launch this campaign.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 sm:p-8 bg-gray-50/50 border-t border-gray-100 flex gap-3 sm:gap-4">
                            <button
                                onClick={() => step === 1 ? setShowModal(false) : setStep(step - 1)}
                                className="flex-1 px-6 py-4 bg-white border-2 border-gray-100 text-gray-400 font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {step === 1 ? 'Cancel' : <><ChevronLeft size={16} /> Back</>}
                            </button>

                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    disabled={step === 1 && (!formData.name || !formData.templateName)}
                                    className="flex-[2] px-6 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-30 text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    Continue <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleLaunch}
                                    disabled={loading || !canLaunch}
                                    className={clsx(
                                        "flex-[2] px-6 py-4 text-white font-black rounded-2xl transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2",
                                        loading || !canLaunch ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                                    )}
                                >
                                    {loading ? 'Processing...' : <><Send size={16} /> Launch</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
