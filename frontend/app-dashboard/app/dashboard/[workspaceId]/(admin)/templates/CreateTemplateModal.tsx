'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { 
    X, Send, AlertCircle, CheckCircle, ChevronRight, ChevronLeft,
    Bold, Italic, Plus, Workflow, Smile
} from 'lucide-react';

interface Flow { id: string; name: string; status: string; }

const LANGUAGES = [
    { code: 'en_US', label: 'English (US)' }, { code: 'en_GB', label: 'English (UK)' },
    { code: 'hi', label: 'Hindi' }, { code: 'ar', label: 'Arabic' },
    { code: 'es', label: 'Spanish' }, { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' }, { code: 'pt_BR', label: 'Portuguese (BR)' },
    { code: 'id', label: 'Indonesian' }, { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' }, { code: 'zh_CN', label: 'Chinese (Simplified)' },
    { code: 'ru', label: 'Russian' }, { code: 'tr', label: 'Turkish' },
];

const CATEGORIES = [
    { value: 'MARKETING', label: 'Marketing', desc: 'Promotions, offers, updates' },
    { value: 'UTILITY', label: 'Utility', desc: 'Transactional and operational' },
    { value: 'AUTHENTICATION', label: 'Authentication', desc: 'OTP and verification' },
];

const BUTTON_TYPES = [
    { value: 'PHONE_NUMBER', label: 'Call phone number' },
    { value: 'URL', label: 'Visit website' },
    { value: 'COPY_CODE', label: 'Copy offer code' },
    { value: 'FLOW', label: 'Complete Flow' },
    { value: 'QUICK_REPLY', label: 'Quick reply' },
];

const BUTTON_ICONS = [
    { value: 'DEFAULT', label: 'Default' },
    { value: 'DOCUMENT', label: 'Document' },
    { value: 'PROMOTION', label: 'Promotion' },
    { value: 'REVIEW', label: 'Review' },
];

interface CreateTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tenantId: string;
    initialData?: { name?: string; category?: string; language?: string; body?: string; flowId?: string } | null;
}

export default function CreateTemplateModal({ isOpen, onClose, onSuccess, tenantId, initialData }: CreateTemplateModalProps) {
    const [step, setStep] = useState(1);
    // Step 1 fields
    const [name, setName] = useState('');
    const [category, setCategory] = useState('MARKETING');
    const [language, setLanguage] = useState('en_US');
    // Step 2 fields
    const [headerType, setHeaderType] = useState<'NONE' | 'TEXT'>('NONE');
    const [headerText, setHeaderText] = useState('');
    const [body, setBody] = useState('');
    const [footer, setFooter] = useState('');
    const [buttons, setButtons] = useState<any[]>([]);
    // Flows for CTA
    const [publishedFlows, setPublishedFlows] = useState<Flow[]>([]);
    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const bodyRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setError(null);
            setSuccess(false);
            if (initialData) {
                setName(initialData.name || '');
                setCategory(initialData.category || 'MARKETING');
                setLanguage(initialData.language || 'en_US');
                setBody(initialData.body || '');
                setHeaderType('NONE');
                setHeaderText('');
                setFooter('');
                setButtons(initialData.flowId ? [{ type: 'FLOW', text: 'View Flow', flow_id: initialData.flowId, flow_action: 'navigate', icon: 'DEFAULT', navigate_screen: '' }] : []);
            } else {
                setName('');
                setCategory('MARKETING');
                setLanguage('en_US');
                setBody('');
                setHeaderType('NONE');
                setHeaderText('');
                setFooter('');
                setButtons([]);
            }
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        if (isOpen) {
            api.get('/whatsapp/flows/published').then(r => setPublishedFlows(r.data || [])).catch(() => {});
        }
    }, [isOpen]);

    const addVariable = () => {
        const textarea = bodyRef.current;
        if (!textarea) return;
        const pos = textarea.selectionStart;
        const varCount = (body.match(/\{\{\d+\}\}/g) || []).length + 1;
        const newBody = body.substring(0, pos) + `{{${varCount}}}` + body.substring(pos);
        setBody(newBody);
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = pos + `{{${varCount}}}`.length;
            textarea.focus();
        }, 10);
    };

    const addButton = () => {
        setButtons(prev => [...prev, { type: 'FLOW', text: 'View Flow', flow_id: '', flow_action: 'navigate', icon: 'DEFAULT', navigate_screen: '' }]);
    };

    const updateButton = (idx: number, key: string, val: string) => {
        setButtons(prev => prev.map((b, i) => i === idx ? { ...b, [key]: val } : b));
    };

    const removeButton = (idx: number) => {
        setButtons(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const components: any[] = [];
            if (headerType === 'TEXT' && headerText) {
                components.push({ type: 'HEADER', format: 'TEXT', text: headerText });
            }
            if (body) {
                components.push({ type: 'BODY', text: body });
            }
            if (footer) {
                components.push({ type: 'FOOTER', text: footer });
            }
            if (buttons.length > 0) {
                const formattedButtons = buttons.map(b => {
                    if (b.type === 'FLOW') {
                        return {
                            type: 'FLOW',
                            text: b.text || 'View Flow',
                            flow_id: b.flow_id,
                            flow_action: b.flow_action || 'navigate',
                            navigate_screen: b.navigate_screen || undefined,
                        };
                    }
                    if (b.type === 'QUICK_REPLY') return { type: 'QUICK_REPLY', text: b.text };
                    if (b.type === 'URL') return { type: 'URL', text: b.text, url: b.url };
                    if (b.type === 'PHONE_NUMBER') return { type: 'PHONE_NUMBER', text: b.text, phone_number: b.phone_number };
                    return b;
                });
                components.push({ type: 'BUTTONS', buttons: formattedButtons });
            }
            await api.post('/templates', {
                tenantId,
                name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                category,
                language,
                components,
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setError(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'Failed to create template. Check Meta guidelines.');
        } finally {
            setLoading(false);
        }
    };

    const renderBodyWithHighlights = (text: string) => {
        if (!text) return <span className="text-gray-400 text-xs italic">Message body will appear here...</span>;
        const parts = text.split(/(\{\{\d+\}\})/g);
        return parts.map((part, i) =>
            /\{\{\d+\}\}/.test(part)
                ? <span key={i} className="bg-blue-100 text-blue-700 px-1 rounded text-xs font-mono">{part}</span>
                : <span key={i}>{part}</span>
        );
    };

    if (!isOpen) return null;

    const STEP_LABELS = ['Set up template', 'Edit template', 'Submit for review'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-8 py-5 border-b flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-6">
                        {STEP_LABELS.map((label, idx) => {
                            const stepNum = idx + 1;
                            const isActive = stepNum === step;
                            const isDone = stepNum < step;
                            return (
                                <div key={stepNum} className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all
                                        ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {isDone ? <CheckCircle size={14} /> : stepNum}
                                    </div>
                                    <span className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                                    {idx < 2 && <ChevronRight size={16} className="text-gray-200 ml-2" />}
                                </div>
                            );
                        })}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl flex items-start gap-2 border border-red-100">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-green-50 text-green-700 text-sm rounded-2xl flex items-start gap-2 border border-green-100">
                                <CheckCircle size={16} className="mt-0.5 shrink-0" />
                                <span>Template submitted for Meta review! It will appear as PENDING.</span>
                            </div>
                        )}

                        {/* STEP 1: Setup */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-1">Template name and language</h2>
                                    <p className="text-sm text-gray-400">Choose a name for your template and select the language it will be sent in.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600 block">Name your template</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="e.g. feedback_survey"
                                            value={name}
                                            onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                            maxLength={512}
                                        />
                                        <span className="absolute right-3 top-3 text-xs text-gray-400 font-mono">{name.length}/512</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Only lowercase letters, numbers, and underscores</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600 block">Category</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {CATEGORIES.map(cat => (
                                            <button key={cat.value}
                                                onClick={() => setCategory(cat.value)}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all ${category === cat.value ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-gray-200'}`}
                                            >
                                                <div className="font-black text-sm text-gray-900">{cat.label}</div>
                                                <div className="text-xs text-gray-400 mt-1">{cat.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600 block">Select language</label>
                                    <select value={language} onChange={e => setLanguage(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none bg-white">
                                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Edit Template */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center font-black text-purple-600 text-lg uppercase">{name.charAt(0) || 'T'}</div>
                                        <div>
                                            <div className="font-black text-gray-900">{name} &bull; {LANGUAGES.find(l => l.code === language)?.label}</div>
                                            <div className="text-xs text-gray-400">{category} &bull; Flows</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Header */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600 block">Header <span className="text-gray-300 font-normal">· Optional</span></label>
                                    <div className="flex gap-2 mb-3">
                                        {(['NONE', 'TEXT'] as const).map(type => (
                                            <button key={type} onClick={() => setHeaderType(type)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${headerType === type ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                                                {type === 'NONE' ? 'None' : 'Text'}
                                            </button>
                                        ))}
                                    </div>
                                    {headerType === 'TEXT' && (
                                        <div className="relative">
                                            <input type="text" placeholder="Add a short line of text to the header" maxLength={60}
                                                value={headerText} onChange={e => setHeaderText(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all" />
                                            <span className="absolute right-3 top-3 text-xs text-gray-400 font-mono">{headerText.length}/60</span>
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600 block">Body</label>
                                    <textarea ref={bodyRef} rows={5} placeholder="Enter your message body. Use {{1}}, {{2}} for variables."
                                        value={body} onChange={e => setBody(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none resize-none transition-all" />
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 bg-gray-50 rounded-xl px-2 py-1">
                                            <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"><Bold size={14} /></button>
                                            <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"><Italic size={14} /></button>
                                            <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"><Smile size={14} /></button>
                                        </div>
                                        <button onClick={addVariable} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 bg-purple-50 rounded-xl font-semibold hover:bg-purple-100 transition-colors">
                                            <Plus size={14} />
                                            Add variable
                                        </button>
                                        <span className="text-xs text-gray-400 ml-auto font-mono">{body.length}/1024</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600 block">Footer <span className="text-gray-300 font-normal">· Optional</span></label>
                                    <div className="relative">
                                        <input type="text" placeholder="Add a short footer text" maxLength={60}
                                            value={footer} onChange={e => setFooter(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all" />
                                        <span className="absolute right-3 top-3 text-xs text-gray-400 font-mono">{footer.length}/60</span>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-600">Buttons <span className="text-gray-300 font-normal">· Optional</span></label>
                                        {buttons.length < 3 && (
                                            <button onClick={addButton} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 bg-purple-50 rounded-xl font-semibold hover:bg-purple-100 transition-colors">
                                                <Plus size={14} />
                                                Add button
                                            </button>
                                        )}
                                    </div>

                                    {buttons.map((btn, idx) => (
                                        <div key={idx} className="p-4 border-2 border-gray-100 rounded-2xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Call to Action</span>
                                                <button onClick={() => removeButton(idx)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Type of Action</label>
                                                    <select value={btn.type} onChange={e => updateButton(idx, 'type', e.target.value)}
                                                        className="w-full px-3 py-2 border-2 border-gray-100 rounded-xl text-sm focus:outline-none bg-white">
                                                        {BUTTON_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                    </select>
                                                </div>
                                                {btn.type === 'FLOW' && (
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Button Icon</label>
                                                        <select value={btn.icon || 'DEFAULT'} onChange={e => updateButton(idx, 'icon', e.target.value)}
                                                            className="w-full px-3 py-2 border-2 border-gray-100 rounded-xl text-sm focus:outline-none bg-white">
                                                            {BUTTON_ICONS.map(ic => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
                                                        </select>
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Button Text</label>
                                                    <input type="text" value={btn.text || ''} maxLength={25}
                                                        onChange={e => updateButton(idx, 'text', e.target.value)}
                                                        className="w-full px-3 py-2 border-2 border-gray-100 rounded-xl text-sm focus:outline-none" />
                                                </div>
                                            </div>

                                            {btn.type === 'FLOW' && (
                                                <div className="p-3 bg-gray-50 rounded-xl space-y-3">
                                                    <div className="flex items-center gap-2 text-xs font-black text-purple-600 uppercase tracking-wider">
                                                        <Workflow size={12} />
                                                        {publishedFlows.find(f => f.id === btn.flow_id)?.name || 'Select a Flow'}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Flow</label>
                                                            <select value={btn.flow_id || ''} onChange={e => updateButton(idx, 'flow_id', e.target.value)}
                                                                className="w-full px-3 py-2 border-2 border-gray-100 rounded-xl text-sm focus:outline-none bg-white">
                                                                <option value="">Select a published flow...</option>
                                                                {publishedFlows.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Flow starts with</label>
                                                            <select value={btn.flow_action || 'navigate'} onChange={e => updateButton(idx, 'flow_action', e.target.value)}
                                                                className="w-full px-3 py-2 border-2 border-gray-100 rounded-xl text-sm focus:outline-none bg-white">
                                                                <option value="navigate">Pre-defined screen</option>
                                                                <option value="data_exchange">Data exchange</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    {btn.flow_action === 'navigate' && (
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Navigate to screen ID</label>
                                                            <input type="text" placeholder="e.g. WELCOME"
                                                                value={btn.navigate_screen || ''}
                                                                onChange={e => updateButton(idx, 'navigate_screen', e.target.value.toUpperCase())}
                                                                className="w-full px-3 py-2 border-2 border-gray-100 rounded-xl text-sm focus:outline-none" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {btn.type === 'URL' && (
                                                <input type="url" placeholder="https://example.com" value={btn.url || ''}
                                                    onChange={e => updateButton(idx, 'url', e.target.value)}
                                                    className="w-full px-3 py-2 border-2 border-gray-100 rounded-xl text-sm focus:outline-none" />
                                            )}
                                            {btn.type === 'PHONE_NUMBER' && (
                                                <input type="tel" placeholder="+91234567890" value={btn.phone_number || ''}
                                                    onChange={e => updateButton(idx, 'phone_number', e.target.value)}
                                                    className="w-full px-3 py-2 border-2 border-gray-100 rounded-xl text-sm focus:outline-none" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Review */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-1">Review and submit</h2>
                                    <p className="text-sm text-gray-400">Verify your template before submitting to Meta for approval.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {[
                                        ['Template name', name],
                                        ['Category', category],
                                        ['Language', LANGUAGES.find(l => l.code === language)?.label],
                                        ['Header', headerType === 'TEXT' ? headerText || '—' : 'None'],
                                        ['Footer', footer || '—'],
                                        ['Buttons', buttons.length > 0 ? `${buttons.length} button(s)` : 'None'],
                                    ].map(([label, val]) => (
                                        <div key={label as string} className="p-4 bg-gray-50 rounded-2xl">
                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</div>
                                            <div className="font-semibold text-gray-900">{val as string}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Message Body</div>
                                    <div className="text-sm text-gray-700 leading-relaxed">{renderBodyWithHighlights(body)}</div>
                                </div>
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-sm text-amber-700">
                                    When utilising template Flow JSON, you are responsible for customising the experience to suit your use case, adhering to applicable laws and complying with WhatsApp Business Messaging Policy.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Live Phone Preview */}
                    <div className="w-80 border-l bg-gray-50 p-6 flex flex-col items-center shrink-0">
                        <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Template preview</div>
                        <div className="relative w-56">
                            {/* Phone frame */}
                            <div className="bg-white rounded-[32px] shadow-2xl border-4 border-gray-200 overflow-hidden">
                                <div className="bg-teal-600 px-4 py-3 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-white/20" />
                                    <span className="text-white text-xs font-bold">Business</span>
                                </div>
                                <div className="bg-[#ece5dd] min-h-[300px] p-3">
                                    <div className="bg-white rounded-xl p-3 shadow-sm max-w-[160px]">
                                        {headerType === 'TEXT' && headerText && (
                                            <div className="font-bold text-gray-900 text-xs mb-2">{headerText}</div>
                                        )}
                                        <div className="text-gray-700 text-[11px] leading-relaxed">
                                            {renderBodyWithHighlights(body || 'Message body will appear here...')}
                                        </div>
                                        {footer && (
                                            <div className="text-gray-400 text-[10px] mt-2">{footer}</div>
                                        )}
                                        <div className="text-right text-gray-300 text-[9px] mt-1">8:26 AM</div>
                                        {buttons.map((btn, i) => (
                                            <div key={i} className="border-t mt-2 pt-2 text-center text-[11px] text-teal-600 font-semibold flex items-center justify-center gap-1">
                                                <Workflow size={10} />
                                                {btn.text || 'View Flow'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-5 border-t flex items-center justify-between bg-white shrink-0">
                    <button onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
                        className="px-6 py-3 border-2 border-gray-100 rounded-2xl text-sm font-black text-gray-400 hover:bg-gray-50 transition-all">
                        {step === 1 ? 'Discard' : 'Previous'}
                    </button>
                    {step < 3 ? (
                        <button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !name.trim()}
                            className="px-6 py-3 bg-purple-600 text-white rounded-2xl text-sm font-black hover:bg-purple-700 disabled:opacity-40 transition-all flex items-center gap-2 shadow-lg shadow-purple-100">
                            Next
                            <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={loading || success}
                            className="px-6 py-3 bg-purple-600 text-white rounded-2xl text-sm font-black hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-purple-100">
                            {loading ? 'Submitting...' : success ? '✓ Submitted!' : (
                                <><Send size={16} />Submit for review</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
