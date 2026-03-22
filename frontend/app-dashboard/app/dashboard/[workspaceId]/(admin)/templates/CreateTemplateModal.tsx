'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { 
    X, Send, AlertCircle, CheckCircle, ChevronRight, ChevronLeft,
    Bold, Italic, Strikethrough, Plus, Workflow, Smile, Code, Image as ImageIcon, Option, List, Play, ExternalLink,
    Phone, FileText, Video, MoreHorizontal, ArrowLeft, Search
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

// Realistic iPhone-style Phone Preview Frame
function PhonePreviewFrame({ children, title = "Business" }: { children: React.ReactNode, title?: string }) {
    return (
        <div className="relative w-[320px] h-[640px] bg-[#1a1a1a] rounded-[3rem] border-[8px] border-[#2a2a2a] shadow-2xl overflow-hidden pointer-events-none scale-[0.85] lg:scale-100 origin-top">
            {/* iPhone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#2a2a2a] rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-10 h-1 bg-[#1a1a1a] rounded-full mr-2" />
                <div className="w-2 h-2 bg-[#1a1a1a] rounded-full" />
            </div>

            {/* Status Bar */}
            <div className="absolute top-0 inset-x-0 h-12 flex items-end justify-between px-6 pb-1.5 z-10 text-[10px] font-bold text-white/90">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 flex items-center justify-center opacity-80"><Code size={10} /></div>
                    <div className="w-4 h-2.5 border border-white/40 rounded-[2px] relative">
                         <div className="absolute left-0.5 top-0.5 bottom-0.5 w-2 bg-white rounded-[1px]" />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="absolute inset-0 pt-12 flex flex-col bg-[#efeae2]">
                {/* WhatsApp Header */}
                <div className="bg-[#008069] h-14 flex items-center px-4 gap-3 shrink-0 shadow-md">
                    <ArrowLeft size={18} className="text-white" />
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-white/40" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-[14px] leading-tight">{title}</span>
                        <span className="text-white/70 text-[10px]">online</span>
                    </div>
                    <div className="ml-auto flex items-center gap-3 text-white">
                        <Play size={16} fill="white" />
                        <MoreHorizontal size={18} />
                    </div>
                </div>

                {/* Chat Background with Doodles */}
                <div className="flex-1 p-3 bg-[url('https://user-images.githubusercontent.com/15072942/150654157-12ed6223-99b3-462d-9658-00d075d654f5.png')] bg-repeat bg-[length:400px] overflow-hidden">
                    <div className="flex flex-col items-start gap-1">
                        {/* Date Separator */}
                        <div className="self-center my-2 px-3 py-1 bg-white/80 rounded-lg shadow-sm text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Today
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

// WhatsApp Bubble Styling (Modern)
function WhatsAppBubble({ children, footer, headerContent }: { children: React.ReactNode, footer?: string, headerContent?: React.ReactNode }) {
    return (
        <div className="flex flex-col w-full max-w-[260px] drop-shadow-sm">
            {/* Bubble Main Body */}
            <div className="bg-white rounded-xl rounded-tl-none p-1 flex flex-col w-full overflow-hidden">
                {headerContent && (
                    <div className="w-full mb-1">
                        {headerContent}
                    </div>
                )}
                <div className="px-2 pt-1 pb-1">
                    {children}
                    {footer && (
                        <p className="text-[11px] text-gray-400 mt-1 italic">{footer}</p>
                    )}
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className="text-[9px] text-gray-400">9:41 AM</span>
                        <CheckCircle size={10} className="text-blue-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Button Action Card (WhatsApp Style)
function ActionButton({ text, iconType }: { text: string, iconType?: string }) {
    const Icon = iconType === 'URL' ? ExternalLink : iconType === 'FLOW' ? List : iconType === 'PHONE_NUMBER' ? Phone : Play;
    return (
        <div className="bg-white rounded-xl mt-1.5 py-2.5 px-4 flex items-center justify-center gap-2 text-[#00a884] font-bold text-[14px] shadow-sm border-t border-gray-100 hover:bg-gray-50 transition-colors w-full max-w-[260px]">
             {iconType !== 'QUICK_REPLY' && <Icon size={16} className="shrink-0" />}
             <span className="truncate">{text}</span>
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

    // Flow Selection State
    const [showFlowSelector, setShowFlowSelector] = useState<{ isOpen: boolean, buttonIdx: number }>({ isOpen: false, buttonIdx: -1 });
    const [showFlowCreator, setShowFlowCreator] = useState<{ isOpen: boolean, buttonIdx: number }>({ isOpen: false, buttonIdx: -1 });
    const [flowSearch, setFlowSearch] = useState('');

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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-[#f0f2f5] rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-[1100px] h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden font-sans transition-all duration-300">
                
                {/* Meta Header */}
                <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 relative z-10">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                        <Workflow size={16} className="text-gray-400" />
                        <span>WhatsApp Manager</span>
                        <ChevronRight size={14} className="text-gray-400 mx-1" />
                        <span className="text-gray-800">Create template</span>
                    </div>
                    
                    {/* Progress Steps - Hidden on extra small, simplified on mobile */}
                    <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 md:gap-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-[#008069] fill-[#008069]/10" />
                            <span className="text-[11px] md:text-sm font-semibold text-gray-900 whitespace-nowrap">Set up</span>
                        </div>
                        <div className={`flex items-center gap-2 ${step >= 2 ? '' : 'opacity-40'}`}>
                            {step > 2 ? <CheckCircle size={16} className="text-[#008069] fill-[#008069]/10" /> : <div className={`w-3.5 h-3.5 rounded-full border-2 ${step===2 ? 'border-[#0866FF]' : 'border-gray-300'}`} />}
                            <span className="text-[11px] md:text-sm font-semibold text-gray-900 whitespace-nowrap">Edit</span>
                        </div>
                        <div className={`flex items-center gap-2 ${step >= 3 ? '' : 'opacity-40'}`}>
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                            <span className="text-[11px] md:text-sm font-semibold text-gray-900 whitespace-nowrap">Submit</span>
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
                    {/* STEP 1: CATEGORY SELECTION */}
                    {step === 1 && (
                        <div className="absolute inset-0 overflow-y-auto p-8 lg:p-12 bg-white">
                            <div className="max-w-4xl mx-auto space-y-10">
                                <div className="border-b border-gray-100 pb-6">
                                    <h1 className="text-2xl font-extrabold text-[#1c1e21] mb-2 tracking-tight">Template name and language</h1>
                                    <p className="text-sm text-[#606770] leading-relaxed">Choose a unique name for your template and select the language it will be sent in. This cannot be changed later.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-[#1c1e21] uppercase tracking-wider">Template Name</label>
                                        <div className="relative group">
                                            <input value={name} onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                                                maxLength={512} placeholder="e.g. shipping_update"
                                                className="w-full px-4 py-3 border border-[#dddfe2] rounded-lg text-sm transition-all focus:border-[#0866FF] focus:ring-4 focus:ring-[#0866FF]/10 outline-none bg-white font-medium" />
                                            <span className="absolute right-4 top-3.5 text-[10px] font-bold text-gray-400">{name.length}/512</span>
                                        </div>
                                        <p className="text-[11px] text-[#606770]">Use only lowercase letters, numbers, and underscores.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-[#1c1e21] uppercase tracking-wider">Select Language</label>
                                        <select value={language} onChange={e => setLanguage(e.target.value)}
                                            className="w-full px-4 py-3 border border-[#dddfe2] rounded-lg text-sm transition-all focus:border-[#0866FF] focus:ring-4 focus:ring-[#0866FF]/10 outline-none bg-white font-medium appearance-none cursor-pointer">
                                            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6">
                                    <label className="text-[13px] font-bold text-[#1c1e21] uppercase tracking-wider block">Category</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        {CATEGORIES.map(cat => (
                                            <div key={cat.value} onClick={() => setCategory(cat.value)}
                                                className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 group ${category === cat.value ? 'border-[#0866FF] bg-[#0866FF]/5 shadow-md' : 'border-[#dddfe2] hover:border-[#ccd0d5] hover:bg-[#f2f3f5]'}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${category === cat.value ? 'border-[#0866FF] bg-[#0866FF]' : 'border-[#ccd0d5] bg-white group-hover:border-[#adb5bd]'}`}>
                                                        {category === cat.value && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />}
                                                    </div>
                                                    <Workflow size={20} className={category === cat.value ? 'text-[#0866FF]' : 'text-[#8d949e]'} />
                                                </div>
                                                <span className={`block font-bold text-[16px] mb-1.5 transition-colors ${category === cat.value ? 'text-[#0866FF]' : 'text-[#1c1e21]'}`}>{cat.label}</span>
                                                <p className="text-[13px] text-[#606770] leading-snug">{cat.desc}</p>
                                                
                                                {category === cat.value && (
                                                    <div className="absolute -top-3 -right-3">
                                                        <div className="bg-[#0866FF] text-white p-1 rounded-full shadow-lg">
                                                            <CheckCircle size={14} fill="currentColor" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="absolute inset-0 flex">
                            
                            {/* Left Panel: Form Settings */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                                
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
                                        
                                        {/* Header Type & Media Selection */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[13px] font-bold text-[#1c1e21] uppercase tracking-wider">Header Content</label>
                                                <span className="text-[11px] text-[#606770] font-medium italic">Optional</span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                                                {[
                                                    { id: 'NONE', label: 'None', icon: X },
                                                    { id: 'TEXT', label: 'Text', icon: FileText },
                                                    { id: 'IMAGE', label: 'Image', icon: ImageIcon },
                                                    { id: 'VIDEO', label: 'Video', icon: Video },
                                                    { id: 'DOCUMENT', label: 'Doc', icon: FileText }
                                                ].map(type => (
                                                    <button key={type.id} 
                                                        onClick={() => {
                                                            if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(type.id)) {
                                                                setMediaType(type.id as any);
                                                                setHeaderType('MEDIA');
                                                            } else {
                                                                setMediaType('NONE');
                                                                setHeaderType(type.id as any);
                                                            }
                                                        }}
                                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all font-bold text-[12px] gap-1.5 ${
                                                            (headerType === type.id || (headerType === 'MEDIA' && mediaType === type.id))
                                                            ? 'border-[#0866FF] bg-[#0866FF]/5 text-[#0866FF]' 
                                                            : 'border-[#dddfe2] hover:border-[#ccd0d5] text-[#606770]'
                                                        }`}>
                                                        <type.icon size={20} />
                                                        {type.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {headerType === 'TEXT' && (
                                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="relative group">
                                                         <input ref={headerRef} value={headerText} onChange={e => setHeaderText(e.target.value)}
                                                            placeholder="e.g. Order Confirmation"
                                                            maxLength={60}
                                                            className="w-full px-4 py-3 border border-[#dddfe2] rounded-lg text-sm bg-white outline-none focus:border-[#0866FF] focus:ring-4 focus:ring-[#0866FF]/10 transition-all font-medium" />
                                                         <span className="absolute right-4 top-3.5 text-[10px] font-bold text-gray-400 group-focus-within:text-[#0866FF]">{headerText.length}/60</span>
                                                    </div>
                                                    <div className="flex justify-end pr-1">
                                                        <button onClick={() => injectVariable('header')} className="text-[12px] font-bold text-[#0866FF] hover:underline flex items-center gap-1">
                                                            <Plus size={14} strokeWidth={3} /> Add Variable
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {headerType === 'MEDIA' && (
                                                <div className="bg-[#f0f2f5] border-2 border-dashed border-[#ccd0d5] rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 group hover:bg-[#ebedf0] transition-colors cursor-pointer animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center text-[#0866FF] group-hover:scale-110 transition-transform">
                                                        {mediaType === 'IMAGE' ? <ImageIcon size={28} /> : mediaType === 'VIDEO' ? <Video size={28} /> : <FileText size={28} />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[14px] font-bold text-[#1c1e21]">Click to upload your {mediaType.toLowerCase()}</p>
                                                        <p className="text-[12px] text-[#606770]">Max size: 16MB. Formats: {mediaType === 'IMAGE' ? 'JPG, PNG' : mediaType === 'VIDEO' ? 'MP4' : 'PDF'}.</p>
                                                    </div>
                                                </div>
                                            )}
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

                                        {/* Body Section */}
                                        <div className="space-y-4 border-t border-gray-100 pt-6">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[13px] font-bold text-[#1c1e21] uppercase tracking-wider">Body Content</label>
                                                <span className="text-[11px] text-[#606770] font-medium">Required</span>
                                            </div>
                                            <div className="border border-[#dddfe2] rounded-xl overflow-hidden focus-within:border-[#0866FF] focus-within:ring-4 focus-within:ring-[#0866FF]/10 transition-all bg-white">
                                                <textarea ref={bodyRef} value={body} onChange={e => setBody(e.target.value)}
                                                    placeholder="Enter your message body here..." rows={6} maxLength={1024}
                                                    className="w-full px-4 py-3 text-sm outline-none resize-none border-0 ring-0 min-h-[120px] font-medium" />
                                                <div className="bg-[#f0f2f5] px-4 py-2.5 flex items-center justify-between border-t border-[#dddfe2]">
                                                    <div className="flex items-center gap-1">
                                                        <button title="Emoji" className="text-[#606770] p-1.5 hover:bg-white hover:text-[#1c1e21] rounded-lg transition-colors"><Smile size={18} /></button>
                                                        <div className="w-px h-5 bg-[#dddfe2] mx-1" />
                                                        <button onClick={()=>injectFormat('*')} title="Bold" className="text-[#606770] p-1.5 hover:bg-white hover:text-[#1c1e21] rounded-lg transition-colors font-bold">B</button>
                                                        <button onClick={()=>injectFormat('_')} title="Italic" className="text-[#606770] p-1.5 hover:bg-white hover:text-[#1c1e21] rounded-lg transition-colors italic">I</button>
                                                        <button onClick={()=>injectFormat('~')} title="Strikethrough" className="text-[#606770] p-1.5 hover:bg-white hover:text-[#1c1e21] rounded-lg transition-colors line-through">S</button>
                                                        <button onClick={()=>injectFormat('```')} title="Monospace" className="text-[#606770] p-1.5 hover:bg-white hover:text-[#1c1e21] rounded-lg transition-colors"><Code size={18} /></button>
                                                        <div className="w-px h-5 bg-[#dddfe2] mx-1" />
                                                        <button onClick={() => injectVariable('body')} className="text-[12px] font-bold text-[#0866FF] hover:bg-white px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                                            <Plus size={14} strokeWidth={3} /> Add Variable
                                                        </button>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-[#8d949e]">{body.length}/1024</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Section */}
                                        <div className="space-y-4 border-t border-gray-100 pt-6">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[13px] font-bold text-[#1c1e21] uppercase tracking-wider">Footer</label>
                                                <span className="text-[11px] text-[#606770] font-medium italic">Optional</span>
                                            </div>
                                            <div className="relative group">
                                                <input value={footer} onChange={e => setFooter(e.target.value)}
                                                    placeholder="e.g. Reply STOP to opt out"
                                                    maxLength={60}
                                                    className="w-full px-4 py-3 border border-[#dddfe2] rounded-lg text-sm bg-white outline-none focus:border-[#0866FF] focus:ring-4 focus:ring-[#0866FF]/10 transition-all font-medium" />
                                                <span className="absolute right-4 top-3.5 text-[10px] font-bold text-gray-400 group-focus-within:text-[#0866FF]">{footer.length}/60</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons Box */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                        <div className="flex items-center gap-2">
                                            <label className="text-[13px] font-bold text-[#1c1e21] uppercase tracking-wider">Interactive Buttons</label>
                                            <span className="text-[10px] bg-[#e7f3ff] text-[#0866FF] px-2 py-0.5 rounded-full font-bold">New</span>
                                        </div>
                                        <button onClick={addButton} disabled={buttons.length >= 10} className="text-[12px] font-bold px-4 py-2 bg-white border border-[#dddfe2] rounded-lg flex items-center gap-2 hover:bg-[#f2f3f5] transition-colors shadow-sm disabled:opacity-50">
                                            <Plus size={16} strokeWidth={3} className="text-[#1c1e21]" /> Add Button
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {buttons.length === 0 ? (
                                            <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                                    <List size={24} />
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium">No buttons added yet. <button onClick={addButton} className="text-[#0866FF] hover:underline">Add one</button></p>
                                            </div>
                                        ) : (
                                            buttons.map((btn, idx) => (
                                                <div key={idx} className="group relative bg-[#f7f8fa] border border-[#dddfe2] rounded-2xl p-5 space-y-5 animate-in zoom-in-95 duration-200">
                                                    <button onClick={() => removeButton(idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                        <X size={18} />
                                                    </button>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="space-y-1.5">
                                                            <span className="text-[11px] font-bold text-[#606770] uppercase">Action Type</span>
                                                            <select value={btn.type} onChange={e => updateButton(idx, 'type', e.target.value)} className="w-full px-3 py-2 border border-[#dddfe2] rounded-lg text-sm outline-none bg-white font-bold text-[#1c1e21] focus:border-[#0866FF] transition-all">
                                                                {BUTTON_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <span className="text-[11px] font-bold text-[#606770] uppercase">Button Text</span>
                                                            <div className="relative">
                                                                <input value={btn.text} onChange={e => updateButton(idx, 'text', e.target.value)} maxLength={25}
                                                                    placeholder="e.g. Shop Now"
                                                                    className="w-full px-3 py-2 border border-[#dddfe2] rounded-lg text-sm bg-white outline-none font-bold text-[#1c1e21] focus:border-[#0866FF] transition-all" />
                                                                <span className="absolute right-3 top-2.5 text-[9px] font-bold text-gray-300">{btn.text.length}/25</span>
                                                            </div>
                                                        </div>
                                                        {btn.type === 'FLOW' && (
                                                            <div className="space-y-1.5">
                                                                <span className="text-[11px] font-bold text-[#606770] uppercase">Button Icon</span>
                                                                <select value={btn.icon || 'DEFAULT'} onChange={e => updateButton(idx, 'icon', e.target.value)} className="w-full px-3 py-2 border border-[#dddfe2] rounded-lg text-sm outline-none bg-white font-bold text-[#1c1e21] focus:border-[#0866FF] transition-all">
                                                                    {BUTTON_ICONS.map(ic => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {btn.type === 'FLOW' && (
                                                        <div className="bg-white border border-[#dddfe2] rounded-xl p-4 space-y-4 shadow-sm border-l-4 border-l-[#0866FF]">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <div className="flex-1">
                                                                    <p className="text-[10px] font-bold text-[#606770] uppercase mb-1">Linked Flow</p>
                                                                    <h4 className="text-sm font-bold text-[#1c1e21]">{publishedFlows.find(f=>f.id===btn.flow_id)?.name || 'No flow selected'}</h4>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button onClick={() => setShowFlowCreator({ isOpen: true, buttonIdx: idx })} className="px-3 py-1.5 bg-[#f0f2f5] hover:bg-[#e4e6eb] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
                                                                        <Plus size={14} strokeWidth={3} /> Create new
                                                                    </button>
                                                                    <button onClick={() => setShowFlowSelector({ isOpen: true, buttonIdx: idx })} className="px-3 py-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
                                                                        <List size={14} /> Use existing
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {btn.flow_id && (
                                                                <div className="grid grid-cols-2 gap-4 pb-1">
                                                                    <div className="space-y-1.5">
                                                                        <span className="text-[11px] font-bold text-[#606770]">Flow starts with</span>
                                                                        <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 flex items-center gap-2">
                                                                            <CheckCircle size={14} className="text-[#008069]" /> Pre-defined screen
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <span className="text-[11px] font-bold text-[#606770]">Target Screen</span>
                                                                        <select value={btn.navigate_screen || 'WELCOME_SCREEN'} onChange={e => updateButton(idx, 'navigate_screen', e.target.value)} className="w-full px-3 py-2 border border-[#dddfe2] rounded-lg text-xs outline-none bg-white font-bold text-[#1c1e21] focus:border-[#0866FF]">
                                                                            <option value="WELCOME_SCREEN">WELCOME_SCREEN</option>
                                                                            <option value="DETAILS">DETAILS</option>
                                                                            <option value="SUMMARY">SUMMARY</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                                       {/* Right Panel: Template Preview */}
                            <div className="hidden lg:flex w-[400px] shrink-0 border-l border-gray-200 bg-[#f8f9fa] flex-col items-center pt-8 p-6 overflow-y-auto">
                                <div className="w-full flex flex-col items-center">
                                    <div className="bg-white rounded-xl p-4 mb-8 flex items-center justify-between shadow-sm border border-gray-100 w-full max-w-[320px]">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-gray-900">Template preview</span>
                                            <span className="text-[10px] text-gray-500 font-medium">Rendered as standard WhatsApp message</span>
                                        </div>
                                        <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-[#008069]"><Play size={14} fill="currentColor" /></button>
                                    </div>
                                    
                                    <PhonePreviewFrame title={name?.toUpperCase() || "BUSINESS NAME"}>
                                        <WhatsAppBubble 
                                            footer={footer}
                                            headerContent={
                                                headerType === 'MEDIA' ? (
                                                    <div className="w-full h-36 bg-gray-100 flex flex-col items-center justify-center text-gray-400 gap-2 border-b border-gray-50">
                                                        {mediaType === 'IMAGE' ? <ImageIcon size={32} /> : mediaType === 'VIDEO' ? <Video size={32} /> : <FileText size={32} />}
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{mediaType} HEADER</span>
                                                    </div>
                                                ) : headerType === 'TEXT' && headerText ? (
                                                    <div className="px-2 pt-2 text-[14px] font-bold text-gray-900 leading-tight">
                                                        {renderTextHighlights(headerText)}
                                                    </div>
                                                ) : null
                                            }
                                        >
                                            <div className="text-[14px] leading-[1.4] whitespace-pre-wrap font-sans text-gray-900 py-0.5">
                                                {renderTextHighlights(body) || 'Hi! Welcome to our business service.'}
                                            </div>
                                        </WhatsAppBubble>
                                        
                                        {/* Buttons as Distinct Cards */}
                                        {buttons.length > 0 && (
                                            <div className="flex flex-col w-full gap-1 mt-0.5">
                                                {buttons.map((b, i) => (
                                                    <ActionButton key={i} text={b.text || 'Action Button'} iconType={b.type} />
                                                ))}
                                            </div>
                                        )}
                                    </PhonePreviewFrame>
                                    
                                    <div className="mt-8 text-center space-y-1">
                                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preview Mode</p>
                                         <p className="text-[11px] text-gray-500 px-8">This is an approximation. The actual display may vary slightly depending on the user's device and WhatsApp version.</p>
                                    </div>
                                </div>
                            </div>
  </div>
                        </div>
                    )}

                    {/* Flow Selector Modal Overlay */}
                    {showFlowSelector.isOpen && (
                        <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
                             <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[80vh] overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <h2 className="text-xl font-extrabold text-[#1c1e21]">Select a Flow</h2>
                                    <button onClick={() => setShowFlowSelector({ isOpen: false, buttonIdx: -1 })} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                                </div>
                                <div className="p-6 border-b border-gray-100">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input value={flowSearch} onChange={e => setFlowSearch(e.target.value)}
                                            placeholder="Search flows by name..."
                                            className="w-full pl-10 pr-4 py-3 bg-[#f0f2f5] border-0 rounded-xl text-sm focus:ring-2 focus:ring-[#0866FF] outline-none" />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {publishedFlows.filter(f => f.name.toLowerCase().includes(flowSearch.toLowerCase())).map(f => (
                                        <div key={f.id} 
                                            onClick={() => {
                                                updateButton(showFlowSelector.buttonIdx, 'flow_id', f.id);
                                                setShowFlowSelector({ isOpen: false, buttonIdx: -1 });
                                            }}
                                            className="group flex items-center justify-between p-4 rounded-2xl hover:bg-[#f0f2f5] cursor-pointer transition-all border border-transparent hover:border-gray-200">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#e7f3ff] rounded-xl flex items-center justify-center text-[#0866FF]">
                                                    <Workflow size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#1c1e21]">{f.name}</p>
                                                    <p className="text-[11px] text-[#606770] font-medium uppercase tracking-wider">{f.status}</p>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-[#0866FF] text-white p-1 rounded-full shadow-sm">
                                                    <CheckCircle size={14} fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                    )}

                    {/* Flow Creator Modal Overlay */}
                    {showFlowCreator.isOpen && (
                        <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
                             <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-[#1c1e21]">Create a Flow</h2>
                                        <p className="text-xs text-[#606770] font-medium mt-0.5">Build a simple survey or interaction for your template</p>
                                    </div>
                                    <button onClick={() => setShowFlowCreator({ isOpen: false, buttonIdx: -1 })} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-20 h-20 bg-[#e7f3ff] rounded-3xl flex items-center justify-center text-[#0866FF] shadow-inner">
                                        <Workflow size={40} />
                                    </div>
                                    <div className="max-w-md space-y-2">
                                        <h3 className="text-lg font-bold text-[#1c1e21]">Survey Flow Builder</h3>
                                        <p className="text-sm text-[#606770]">You can build a simple survey flow directly here. For more complex logic, please use the Main Flow Builder.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                                        <div className="p-6 border-2 border-[#dddfe2] rounded-2xl hover:border-[#0866FF] cursor-pointer transition-all group bg-white shadow-sm">
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#e7f3ff] group-hover:text-[#0866FF] transition-colors"><List size={20} /></div>
                                            <h4 className="font-bold text-[#1c1e21] mb-1">Single Question</h4>
                                            <p className="text-[11px] text-[#606770]">One screen with options</p>
                                        </div>
                                        <div className="p-6 border-2 border-[#dddfe2] rounded-2xl hover:border-[#0866FF] cursor-pointer transition-all group bg-white shadow-sm">
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#e7f3ff] group-hover:text-[#0866FF] transition-colors"><Workflow size={20} /></div>
                                            <h4 className="font-bold text-[#1c1e21] mb-1">Multiple Screens</h4>
                                            <p className="text-[11px] text-[#606770]">Sequential survey flow</p>
                                        </div>
                                    </div>
                                    <button className="px-8 py-3 bg-[#0866FF] text-white font-bold rounded-xl shadow-lg hover:bg-[#166fe5] hover:scale-105 transition-all">Start Building</button>
                                </div>
                             </div>
                        </div>
                    )}

                    {/* Bottom Sticky Navigation Bar */}
                    <div className="sticky bottom-0 inset-x-0 h-16 sm:h-20 bg-white border-t border-gray-200 flex items-center justify-end px-4 sm:px-8 gap-3 sm:gap-4 z-20 shrink-0">
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)}
                                className="px-4 sm:px-5 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-all active:scale-95 text-sm sm:text-base">
                                Previous
                            </button>
                        )}
                        {step === 1 ? (
                            <button onClick={() => setStep(2)} disabled={!name}
                                className="px-6 sm:px-8 py-2 bg-[#0866FF] text-white font-bold rounded-lg shadow-sm hover:bg-[#0759f6] disabled:opacity-50 transition-all active:scale-95 text-sm sm:text-base">
                                Next
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={loading || !body}
                                className="px-6 sm:px-8 py-2 bg-[#0866FF] text-white font-bold rounded-lg shadow-sm hover:bg-[#0759f6] disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2 text-sm sm:text-base">
                                {loading ? 'Submitting...' : 'Submit for review'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

{/* --- Helper Components & Functions --- */}

const renderTextHighlights = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*[^\*]+\*|_[^_]+_|~[^~]+~|```[^\`]+```|\{\{[0-9]+\}\})/g);
    return parts.map((part, i) => {
        if (part.startsWith('*') && part.endsWith('*')) return <strong key={i}>{part.slice(1, -1)}</strong>;
        if (part.startsWith('_') && part.endsWith('_')) return <em key={i}>{part.slice(1, -1)}</em>;
        if (part.startsWith('~') && part.endsWith('~')) return <del key={i}>{part.slice(1, -1)}</del>;
        if (part.startsWith('```') && part.endsWith('```')) return <code key={i} className="bg-gray-100 px-1 rounded">{part.slice(3, -3)}</code>;
        if (part.startsWith('{{') && part.endsWith('}}')) return <span key={i} className="text-[#0866FF] font-bold">{part}</span>;
        return part;
    });
};
