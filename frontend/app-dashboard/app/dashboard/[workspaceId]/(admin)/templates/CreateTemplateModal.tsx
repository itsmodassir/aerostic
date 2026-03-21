'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { 
    X, Send, AlertCircle, CheckCircle, ChevronRight, ChevronLeft,
    Bold, Italic, Strikethrough, Plus, Workflow, Smile, Code, Image as ImageIcon, Option, List, Play, ExternalLink
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

// Reusable WhatsApp chat bubble layout
function PhonePreviewFrame({ children, headerType }: { children: React.ReactNode, headerType?: string }) {
    return (
        <div className="w-80 shrink-0 select-none">
            <div className="bg-[#E4DCCE] w-full min-h-[400px] rounded-lg overflow-hidden shadow-inner flex flex-col border border-gray-200">
                <div className="bg-[#008069] h-14 flex items-center px-4 gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-white/50" />
                    </div>
                    <span className="text-white font-medium text-[15px]">Business</span>
                </div>
                {/* Chat Area Background */}
                <div className="flex-1 p-3 bg-[url('https://static.whatsapp.net/rsrc.php/v3/yO/r/YqsE136z19q.png')] bg-repeat bg-[length:260px]">
                    <div className="flex justify-start max-w-[90%]">
                        <div className="bg-white rounded-lg rounded-tl-none p-1.5 shadow-sm text-sm text-[#111b21] relative flex flex-col w-full">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface CreateTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tenantId: string;
    initialData?: { name?: string; category?: string; language?: string; body?: string; flowId?: string } | null;
}

export default function CreateTemplateModal({ isOpen, onClose, onSuccess, tenantId, initialData }: CreateTemplateModalProps) {
    const [step, setStep] = useState(1);
    
    // Step 1
    const [name, setName] = useState('');
    const [category, setCategory] = useState('MARKETING');
    const [language, setLanguage] = useState('en_US');
    
    // Step 2
    const [headerType, setHeaderType] = useState<'NONE' | 'TEXT' | 'MEDIA'>('NONE');
    const [headerText, setHeaderText] = useState('');
    const [mediaType, setMediaType] = useState<'NONE' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'>('NONE');
    const [varType, setVarType] = useState('Number');
    
    const [body, setBody] = useState('');
    const [footer, setFooter] = useState('');
    const [buttons, setButtons] = useState<any[]>([]);
    
    // API Data
    const [publishedFlows, setPublishedFlows] = useState<Flow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    
    const bodyRef = useRef<HTMLTextAreaElement>(null);
    const headerRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setStep(1); setError(null); setSuccess(false);
            if (initialData) {
                setName(initialData.name || '');
                setCategory(initialData.category || 'MARKETING');
                setLanguage(initialData.language || 'en_US');
                setBody(initialData.body || '');
                setHeaderType('NONE'); setHeaderText(''); setFooter(''); setMediaType('NONE');
                setButtons(initialData.flowId ? [{ type: 'FLOW', text: 'View Flow', flow_id: initialData.flowId, flow_action: 'navigate', icon: 'DEFAULT', navigate_screen: 'WELCOME_SCREEN' }] : []);
            } else {
                setName(''); setCategory('MARKETING'); setLanguage('en_US');
                setBody(''); setHeaderType('NONE'); setHeaderText(''); setFooter(''); setMediaType('NONE'); setButtons([]);
            }
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        if (isOpen) {
            api.get('/whatsapp/flows/published').then(r => setPublishedFlows(r.data || [])).catch(() => {});
        }
    }, [isOpen]);

    const injectVariable = (target: 'body' | 'header') => {
        if (target === 'body') {
            const textarea = bodyRef.current;
            if (!textarea) return;
            const pos = textarea.selectionStart;
            const varCount = (body.match(/\{\{\d+\}\}/g) || []).length + 1;
            const newBody = body.substring(0, pos) + `{{${varCount}}}` + body.substring(pos);
            setBody(newBody);
            setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = pos + `{{${varCount}}}`.length; textarea.focus(); }, 10);
        } else {
            const input = headerRef.current;
            if (!input) return;
            const pos = input.selectionStart || headerText.length;
            const newText = headerText.substring(0, pos) + `{{1}}` + headerText.substring(pos);
            setHeaderText(newText);
            setTimeout(() => { input.selectionStart = input.selectionEnd = pos + `{{1}}`.length; input.focus(); }, 10);
        }
    };

    const injectFormat = (formatStr: string) => {
        const textarea = bodyRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = body.slice(start, end);
        const replacement = `${formatStr}${selected}${formatStr}`;
        setBody(body.slice(0, start) + replacement + body.slice(end));
        setTimeout(() => { textarea.selectionStart = start + formatStr.length; textarea.selectionEnd = end + formatStr.length; textarea.focus(); }, 10);
    };

    const addButton = () => {
        setButtons(prev => [...prev, { type: 'FLOW', text: 'View Flow', flow_id: publishedFlows[0]?.id || '', flow_action: 'navigate', icon: 'DEFAULT', navigate_screen: 'WELCOME_SCREEN' }]);
    };

    const updateButton = (idx: number, key: string, val: string) => {
        setButtons(prev => prev.map((b, i) => i === idx ? { ...b, [key]: val } : b));
    };

    const removeButton = (idx: number) => {
        setButtons(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async () => {
        setLoading(true); setError(null);
        try {
            const components: any[] = [];
            if (headerType === 'TEXT' && headerText) {
                components.push({ type: 'HEADER', format: 'TEXT', text: headerText });
            } else if (headerType === 'MEDIA' && mediaType !== 'NONE') {
                components.push({ type: 'HEADER', format: mediaType });
            }
            
            if (body) components.push({ type: 'BODY', text: body });
            if (footer) components.push({ type: 'FOOTER', text: footer });
            
            if (buttons.length > 0) {
                const formattedButtons = buttons.map(b => {
                    if (b.type === 'FLOW') {
                        return { type: 'FLOW', text: b.text || 'View Flow', flow_id: b.flow_id, flow_action: b.flow_action || 'navigate', navigate_screen: b.navigate_screen || 'WELCOME_SCREEN', icon: b.icon !== 'DEFAULT' ? b.icon : undefined };
                    }
                    if (b.type === 'QUICK_REPLY') return { type: 'QUICK_REPLY', text: b.text };
                    if (b.type === 'URL') return { type: 'URL', text: b.text, url: b.url };
                    if (b.type === 'PHONE_NUMBER') return { type: 'PHONE_NUMBER', text: b.text, phone_number: b.phone_number };
                    return b;
                });
                components.push({ type: 'BUTTONS', buttons: formattedButtons });
            }
            await api.post('/templates', {
                tenantId, name, category, language, components,
            });
            setSuccess(true); setTimeout(() => { onSuccess(); onClose(); }, 2000);
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setError(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'Failed to create template. Check Meta guidelines.');
        } finally {
            setLoading(false);
        }
    };

    const renderTextHighlights = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(\{\{\d+\}\})/g);
        return parts.map((part, i) =>
            /\{\{\d+\}\}/.test(part)
                ? <span key={i} className="text-[#008069] bg-emerald-50 px-1 rounded mx-0.5">{part}</span>
                : <span key={i}>{part}</span>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-[#f0f2f5] rounded-xl shadow-2xl w-full max-w-[1100px] h-[90vh] flex flex-col overflow-hidden font-sans">
                
                {/* Meta Header */}
                <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 relative z-10">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                        <Workflow size={16} className="text-gray-400" />
                        <span>WhatsApp Manager</span>
                        <ChevronRight size={14} className="text-gray-400 mx-1" />
                        <span className="text-gray-800">Create template</span>
                    </div>
                    
                    {/* Progress Steps */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-[#008069] fill-[#008069]/10" />
                            <span className="text-sm font-semibold text-gray-900">Set up template</span>
                        </div>
                        <div className={`flex items-center gap-2 ${step >= 2 ? '' : 'opacity-40'}`}>
                            {step > 2 ? <CheckCircle size={18} className="text-[#008069] fill-[#008069]/10" /> : <div className={`w-4 h-4 rounded-full border-2 ${step===2 ? 'border-[#0866FF] border-l-[#0866FF]/30' : 'border-gray-300'}`} />}
                            <span className="text-sm font-semibold text-gray-900">Edit template</span>
                        </div>
                        <div className={`flex items-center gap-2 ${step >= 3 ? '' : 'opacity-40'}`}>
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                            <span className="text-sm font-semibold text-gray-900">Submit for review</span>
                        </div>
                    </div>

                    <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-full"><X size={20} /></button>
                </div>

                {/* Sub Header for Step 2+ */}
                {step === 2 && (
                    <div className="bg-white border-b border-gray-200 p-4 px-6 shrink-0 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#008069] flex items-center justify-center text-white rounded-xl shadow-sm">
                            <Workflow size={24} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                {name || 'new_template'} • {LANGUAGES.find(l=>l.code===language)?.label}
                            </h2>
                            <p className="text-xs text-gray-500">{CATEGORIES.find(c=>c.value===category)?.label} • Flows</p>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-hidden relative">
                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="absolute inset-0 overflow-y-auto p-10 bg-white">
                            <div className="max-w-2xl mx-auto space-y-8">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Template name and language</h1>
                                    <p className="text-sm text-gray-600">Choose a name for your template and select the language it will be sent in.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-700">Name your template</label>
                                            <div className="relative">
                                                <input value={name} onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                                                    maxLength={512} placeholder="e.g. feedback"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-[#0866FF] focus:ring-1 focus:ring-[#0866FF] outline-none" />
                                                <span className="absolute right-3 top-2.5 text-xs text-gray-400">{name.length}/512</span>
                                            </div>
                                            <p className="text-xs text-gray-500">Only lowercase letters, numbers, and underscores.</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-700">Select language</label>
                                            <select value={language} onChange={e => setLanguage(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-[#0866FF] focus:ring-1 focus:ring-[#0866FF] outline-none bg-white">
                                                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1 pt-4">
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Category</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {CATEGORIES.map(cat => (
                                                <div key={cat.value} onClick={() => setCategory(cat.value)}
                                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${category === cat.value ? 'border-[#0866FF] bg-blue-50/50 shadow-sm ring-1 ring-[#0866FF]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${category === cat.value ? 'border-[#0866FF]' : 'border-gray-300'}`}>
                                                            {category === cat.value && <div className="w-2.5 h-2.5 bg-[#0866FF] rounded-full" />}
                                                        </div>
                                                        <span className="font-bold text-sm text-gray-900">{cat.label}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 pl-6">{cat.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="absolute inset-0 flex">
                            
                            {/* Left Panel: Form Settings */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                
                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center gap-2">
                                        <AlertCircle size={16} /> {error}
                                    </div>
                                )}

                                {/* Content Box */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div className="p-5 border-b border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-900">Content</h3>
                                        <p className="text-sm text-gray-500 mt-1">Add a header, body and footer for your template. Cloud API hosted by Meta will review the template variables and content.</p>
                                    </div>
                                    <div className="p-5 space-y-5">
                                        
                                        {/* Variable Type & Media Dropdowns */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {body.includes('{{') && (
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-bold text-gray-800 flex items-center gap-1">Type of variable</label>
                                                    <select value={varType} onChange={e => setVarType(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white outline-none focus:border-[#0866FF]">
                                                        <option value="Number">Number</option>
                                                        <option value="Text">Text</option>
                                                        <option value="Date">Date</option>
                                                        <option value="Currency">Currency</option>
                                                    </select>
                                                </div>
                                            )}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-gray-800 flex items-center gap-1">Media sample <span className="text-gray-400 font-normal ml-1">· Optional</span></label>
                                                <select value={mediaType} onChange={e => {setMediaType(e.target.value as any); if(e.target.value !== 'NONE') setHeaderType('MEDIA');}}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white outline-none focus:border-[#0866FF]">
                                                    <option value="NONE">None</option>
                                                    <option value="IMAGE">Image</option>
                                                    <option value="VIDEO">Video</option>
                                                    <option value="DOCUMENT">Document</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Header */}
                                        <div className="space-y-1.5 border-t border-gray-100 pt-5">
                                            <label className="text-[13px] font-bold text-gray-800 flex items-center gap-1">Header <span className="text-gray-400 font-normal ml-1">· Optional</span></label>
                                            {mediaType === 'NONE' && (
                                                <div className="relative">
                                                    <input ref={headerRef} value={headerText} onChange={e => {setHeaderText(e.target.value); if(e.target.value) setHeaderType('TEXT'); else setHeaderType('NONE');}}
                                                        placeholder="Add a short line of text to the header of your message in English"
                                                        maxLength={60}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#0866FF]" />
                                                    <span className="absolute right-3 top-2.5 text-xs text-gray-400">{headerText.length}/60</span>
                                                </div>
                                            )}
                                            {mediaType !== 'NONE' && (
                                                <div className="p-3 border border-gray-300 rounded bg-gray-50 flex items-center justify-center text-sm text-gray-500">
                                                    <ImageIcon size={18} className="mr-2" /> {mediaType} attached
                                                </div>
                                            )}
                                            <div className="flex justify-end pt-1">
                                                <button onClick={() => injectVariable('header')} disabled={mediaType !== 'NONE'} className="text-[13px] font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 disabled:opacity-30">
                                                    <Plus size={14} /> Add variable
                                                </button>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="space-y-1.5 border-t border-gray-100 pt-5">
                                            <label className="text-[13px] font-bold text-gray-800">Body</label>
                                            <div className="border border-gray-300 rounded overflow-hidden focus-within:border-[#0866FF]">
                                                <textarea ref={bodyRef} value={body} onChange={e => setBody(e.target.value)}
                                                    placeholder="Hello world!" rows={5} maxLength={1024}
                                                    className="w-full px-3 py-2 text-sm outline-none resize-none border-0 ring-0 min-h-[100px]" />
                                                <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-t border-gray-200">
                                                    <div className="flex items-center gap-2">
                                                        <button className="text-gray-500 p-1 hover:bg-gray-200 rounded"><Smile size={16} /></button>
                                                        <button onClick={()=>injectFormat('*')} className="text-gray-500 p-1 hover:bg-gray-200 rounded font-serif font-bold">B</button>
                                                        <button onClick={()=>injectFormat('_')} className="text-gray-500 p-1 hover:bg-gray-200 rounded font-serif italic">I</button>
                                                        <button onClick={()=>injectFormat('~')} className="text-gray-500 p-1 hover:bg-gray-200 rounded line-through">S</button>
                                                        <button onClick={()=>injectFormat('```')} className="text-gray-500 p-1 hover:bg-gray-200 rounded"><Code size={16} /></button>
                                                        <div className="w-px h-4 bg-gray-300 mx-1" />
                                                        <button onClick={() => injectVariable('body')} className="text-[13px] font-semibold text-gray-700 hover:text-gray-900 justify-center flex items-center gap-1 px-1">
                                                            <Plus size={14} /> Add variable
                                                        </button>
                                                    </div>
                                                    <span className="text-xs text-gray-400">{body.length}/1024</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="space-y-1.5 border-t border-gray-100 pt-5">
                                            <label className="text-[13px] font-bold text-gray-800 flex items-center gap-1">Footer <span className="text-gray-400 font-normal ml-1">· Optional</span></label>
                                            <div className="relative">
                                                <input value={footer} onChange={e => setFooter(e.target.value)}
                                                    placeholder="Add a short line of text to the bottom of your message in English"
                                                    maxLength={60}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#0866FF]" />
                                                <span className="absolute right-3 top-2.5 text-xs text-gray-400">{footer.length}/60</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons Box */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                        <label className="text-[13px] font-bold text-gray-800">Buttons <span className="text-gray-400 font-normal ml-1">· Optional</span></label>
                                        <button onClick={addButton} className="text-xs font-semibold px-3 py-1.5 border border-gray-300 rounded flex items-center gap-1 hover:bg-gray-50">
                                            <Plus size={14} /> Add button
                                        </button>
                                    </div>
                                    {buttons.length > 0 && (
                                        <div className="p-5 space-y-4">
                                            {buttons.map((btn, idx) => (
                                                <div key={idx} className="space-y-4">
                                                    <label className="text-[13px] font-bold text-gray-800">Call to Action <span className="text-gray-400 font-normal ml-1">· Optional</span></label>
                                                    <div className="bg-[#f5f6f6] border border-gray-200 rounded p-4">
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div>
                                                                <span className="text-xs font-semibold text-gray-700 block mb-1">Type of Action</span>
                                                                <select value={btn.type} onChange={e => updateButton(idx, 'type', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none bg-white font-medium">
                                                                    {BUTTON_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                                </select>
                                                            </div>
                                                            {btn.type === 'FLOW' && (
                                                                <div>
                                                                    <span className="text-xs font-semibold text-gray-700 block mb-1">Button Icon</span>
                                                                    <select value={btn.icon || 'DEFAULT'} onChange={e => updateButton(idx, 'icon', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none bg-white font-medium flex items-center">
                                                                        {BUTTON_ICONS.map(ic => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
                                                                    </select>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="text-xs font-semibold text-gray-700 block mb-1">Button Text</span>
                                                                <div className="relative">
                                                                    <input value={btn.text} onChange={e => updateButton(idx, 'text', e.target.value)} maxLength={25}
                                                                        className="w-full px-2 py-1.5 pr-8 border border-gray-300 rounded text-sm outline-none font-medium" />
                                                                    <span className="absolute right-2 top-2 text-[10px] text-gray-400">{btn.text.length}/25</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {btn.type === 'FLOW' && (
                                                            <div className="mt-4 space-y-4">
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-sm font-bold text-gray-900 flex-1">{publishedFlows.find(f=>f.id===btn.flow_id)?.name || 'Select a Flow'}</span>
                                                                        <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50">Preview</button>
                                                                        <button onClick={() => updateButton(idx, 'flow_id', '')} className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50">Delete</button>
                                                                    </div>
                                                                    {!btn.flow_id && (
                                                                         <select value={btn.flow_id} onChange={e => updateButton(idx, 'flow_id', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded mt-1 bg-white">
                                                                            <option value="">Select Flow</option>
                                                                            {publishedFlows.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                                                        </select>
                                                                    )}
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3 pb-2">
                                                                    <div>
                                                                        <span className="text-xs font-semibold text-gray-700 block mb-1">Flow starts with</span>
                                                                        <select className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 text-gray-500 font-medium cursor-not-allowed" disabled>
                                                                            <option>Pre-defined screen</option>
                                                                        </select>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-xs font-semibold text-gray-700 block mb-1">Select pre-defined screen</span>
                                                                        <select value={btn.navigate_screen || 'WELCOME_SCREEN'} onChange={e => updateButton(idx, 'navigate_screen', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none bg-white font-medium">
                                                                            <option value="WELCOME_SCREEN">WELCOME_SCREEN</option>
                                                                            <option value="DETAILS">DETAILS</option>
                                                                            <option value="SUMMARY">SUMMARY</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Panel: Template Preview */}
                            <div className="w-[360px] shrink-0 border-l border-gray-200 bg-[#f5f6f6] flex flex-col items-center pt-8 p-6">
                                <div className="w-full max-w-sm">
                                    <div className="bg-white rounded p-4 mb-4 flex items-center justify-between shadow-sm">
                                        <span className="font-bold text-sm text-gray-900">Template preview</span>
                                        <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"><Play size={14} /></button>
                                    </div>
                                    <PhonePreviewFrame>
                                        <div className="p-1.5 flex flex-col relative space-y-1 mt-1">
                                            {/* Media Header */}
                                            {mediaType !== 'NONE' && (
                                                <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center mb-1">
                                                    <ImageIcon className="text-gray-400" size={32} />
                                                </div>
                                            )}
                                            {/* Text Header */}
                                            {headerType === 'TEXT' && headerText && (
                                                <div className="font-bold text-[15px] mb-1">{renderTextHighlights(headerText)}</div>
                                            )}
                                            {/* Body */}
                                            <div className="text-[14.5px] leading-relaxed whitespace-pre-wrap font-sans text-gray-900">
                                                {renderTextHighlights(body) || 'Hello!'}
                                            </div>
                                            {/* Footer */}
                                            {footer && (
                                                <div className="text-[12px] text-gray-400 pt-1 mt-1">{footer}</div>
                                            )}
                                            <div className="text-[10px] text-gray-400 self-end translate-y-2 translate-x-1.5 mt-[-10px]">
                                                11:52 AM
                                            </div>
                                        </div>
                                        {/* Render Buttons below the bubble content layout */}
                                        {buttons.length > 0 && (
                                            <div className="mt-1 flex flex-col w-full border-t border-gray-100 divide-y divide-gray-100">
                                                {buttons.map((b, i) => (
                                                    <button key={i} className="py-2.5 text-[#00a884] font-medium text-[15px] flex items-center justify-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors w-full rounded-b-lg">
                                                        {b.type === 'FLOW' && <List size={16} />} 
                                                        {b.type === 'URL' && <ExternalLink size={16} />} 
                                                        {b.text || 'Action'}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </PhonePreviewFrame>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom Fixed Navigation Bar */}
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-white border-t border-gray-200 flex items-center justify-end px-8 gap-4 z-20">
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)}
                                className="px-5 py-2 border border-gray-300 text-gray-700 font-bold rounded shadow-sm hover:bg-gray-50">
                                Previous
                            </button>
                        )}
                        {step === 1 ? (
                            <button onClick={() => setStep(2)} disabled={!name}
                                className="px-5 py-2 bg-[#0866FF] text-white font-bold rounded shadow-sm hover:bg-[#0759f6] disabled:opacity-50 transition-colors">
                                Next
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={loading || !body}
                                className="px-5 py-2 bg-[#0866FF] text-white font-bold rounded shadow-sm hover:bg-[#0759f6] disabled:opacity-50 transition-colors flex items-center gap-2">
                                {loading ? 'Submitting...' : 'Submit for review'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
