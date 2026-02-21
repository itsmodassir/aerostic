"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Send, Copy, AlertCircle, FileSpreadsheet, Users, UserCheck, ChevronRight, ChevronLeft, Upload } from 'lucide-react';
import { useParams } from 'next/navigation';
import Papa from 'papaparse';

interface Campaign {
    id: string;
    name: string;
    status: string;
    sentCount: number;
    failedCount: number;
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
                const activeMembership = memberships.find((m: any) => m.tenant?.slug === workspaceSlug);
                if (activeMembership && activeMembership.tenant?.id) {
                    const tid = activeMembership.tenant.id;
                    setTenantId(tid);
                    fetchCampaigns(tid);
                    fetchTemplates(tid);
                }
            } catch (e) {
                console.error('Failed to resolve tenant');
            }
        };
        initTenant();
    }, [params.workspaceId]);

    const fetchTemplates = async (tid: string) => {
        try {
            const res = await api.get(`/templates?tenantId=${tid}`);
            setTemplates(res.data.filter((t: any) => t.status === 'APPROVED'));
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
            complete: (results) => {
                const validRows = results.data.map((row: any) => ({
                    name: row.name || row.Name || 'Valued Customer',
                    phoneNumber: row.phone || row.Phone || row.mobile || row.Mobile || ''
                })).filter(r => r.phoneNumber);

                setCsvPreview(validRows.slice(0, 5)); // Show top 5
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
        if (!confirm('Are you sure you want to launch this campaign?')) return;
        setLoading(true);

        try {
            // 1. Create
            const createRes = await api.post('/campaigns', {
                tenantId,
                name: formData.name,
                templateName: formData.templateName,
                templateLanguage: formData.templateLanguage,
                recipientType: formData.recipientType,
                recipients: formData.recipientType !== 'ALL' ? formData.recipients : []
            });

            const campaignId = createRes.data.id;

            // 2. Dispatch
            await api.post(`/campaigns/${campaignId}/send`, { tenantId });

            setShowModal(false);
            setFormData({
                name: '', templateName: '', templateLanguage: 'en_US',
                recipientType: 'ALL', recipients: []
            });
            setStep(1);
            fetchCampaigns(tenantId);
            alert('Campaign launched successfully!');
        } catch (error) {
            alert('Failed to launch campaign');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                <input
                    required
                    className="w-full border rounded-md px-3 py-2 mt-1"
                    placeholder="e.g. Summer Sale 2024"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Select Template</label>
                <select
                    className="w-full border rounded-md px-3 py-2 mt-1 bg-white"
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
                    <option value="" disabled>Select a template...</option>
                    <option value="hello_world">hello_world (Test)</option>
                    {templates.map(t => (
                        <option key={t.id} value={t.name}>{t.name} ({t.language})</option>
                    ))}
                </select>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                {['ALL', 'CSV', 'MANUAL'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFormData({ ...formData, recipientType: type })}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition ${formData.recipientType === type ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        {type === 'ALL' ? 'All Contacts' : type === 'CSV' ? 'Upload CSV' : 'Manual Input'}
                    </button>
                ))}
            </div>

            {formData.recipientType === 'ALL' && (
                <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800">
                    <Users size={20} />
                    <p className="text-sm">This will send the message to all saved contacts in your database.</p>
                </div>
            )}

            {formData.recipientType === 'CSV' && (
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <label className="cursor-pointer">
                            <span className="text-blue-600 font-medium">Click to upload</span>
                            <span className="text-gray-500"> or drag and drop</span>
                            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                        </label>
                        <p className="text-xs text-gray-400 mt-1">CSV with headers: phone, name (optional)</p>
                    </div>
                    {csvPreview.length > 0 && (
                        <div className="bg-gray-50 rounded border p-3">
                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Preview (First 5 of {formData.recipients.length})</p>
                            <div className="text-xs space-y-1">
                                {csvPreview.map((r, i) => (
                                    <div key={i} className="flex justify-between">
                                        <span>{r.name}</span>
                                        <span className="font-mono text-gray-600">{r.phoneNumber}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {formData.recipientType === 'MANUAL' && (
                <div>
                    <textarea
                        className="w-full h-32 border rounded-md p-3 text-sm font-mono"
                        placeholder="919876543210, John Doe&#10;919988776655, Jane Smith"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        onBlur={handleManualProcess}
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: phone, name (one per line). Click outside to process.</p>
                    {formData.recipients.length > 0 && (
                        <p className="text-xs text-green-600 font-bold mt-2">{formData.recipients.length} contacts valid.</p>
                    )}
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Campaign Name:</span>
                    <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Template:</span>
                    <span className="font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">{formData.templateName}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Target Audience:</span>
                    <span className="font-medium flex items-center gap-1">
                        {formData.recipientType === 'ALL' ? <Users size={14} /> : <FileSpreadsheet size={14} />}
                        {formData.recipientType === 'ALL' ? 'All Contacts' : `${formData.recipients.length} Recipients`}
                    </span>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0" size={16} />
                <p className="text-xs text-yellow-800">
                    Always ensure you have explicit consent from recipients. Unsolicited messages may lead to number bans.
                </p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Broadcasts</h1>
                    <p className="text-sm text-gray-500">Advanced marketing campaigns.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} /> New Campaign
                </button>
            </div>

            <div className="grid gap-4">
                {campaigns.map((camp) => (
                    <div key={camp.id} className="bg-white p-6 rounded-lg shadow-sm border flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-lg">{camp.name}</h3>
                            <div className="flex gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${camp.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>{camp.status}</span>
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                    {camp.recipientType || 'ALL'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{camp.totalContacts}</p>
                            <p className="text-xs text-gray-500 uppercase">Targeted</p>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="font-bold text-lg">New Broadcast</h2>
                            <div className="text-xs font-bold text-gray-400">STEP {step} OF 3</div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-between">
                            <button
                                onClick={() => step === 1 ? setShowModal(false) : setStep(step - 1)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                            >
                                {step === 1 ? 'Cancel' : <><ChevronLeft size={16} /> Back</>}
                            </button>

                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    disabled={step === 1 && (!formData.name || !formData.templateName)}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-1 disabled:opacity-50"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleLaunch}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    {loading ? 'Launching...' : <><Send size={16} /> Launch Campaign</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
