'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, X, ArrowLeft, ArrowRight, Zap, 
  MessageSquare, Layout, Type, Palette, 
  Globe, Info, Image as ImageIcon, Video, 
  FileText as DocIcon, Trash2, Link, Phone,
  CheckCircle2, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/lib/api';
import TemplatePreview from './TemplatePreview';

interface ProfessionalBuilderProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { id: 'MARKETING', label: 'Marketing', desc: 'Promote products, services, or events.', icon: Zap, color: 'text-amber-500 bg-amber-50' },
  { id: 'UTILITY', label: 'Utility', desc: 'Send transaction updates or account notifications.', icon: MessageSquare, color: 'text-blue-500 bg-blue-50' },
  { id: 'AUTHENTICATION', label: 'Authentication', desc: 'Send one-time passcodes for security.', icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
];

const LANGUAGES = [
  { id: 'en_US', label: 'English (US)' },
  { id: 'hi_IN', label: 'Hindi' },
  { id: 'pt_BR', label: 'Portuguese (BR)' },
];

export default function ProfessionalBuilder({ onClose, onSuccess }: ProfessionalBuilderProps) {
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [flows, setFlows] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<any>({
    name: '',
    category: 'MARKETING',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'TEXT', text: '' },
      { type: 'BODY', text: '' },
      { type: 'FOOTER', text: '' },
      { type: 'BUTTONS', buttons: [] as any[] }
    ]
  });

  useEffect(() => {
    const fetchFlows = async () => {
      try { const r = await api.get('/whatsapp/flows/published'); setFlows(r.data || []); }
      catch { console.error('Failed to load flows'); }
    };
    fetchFlows();
  }, []);

  const updateComponent = (type: string, data: any) => {
    const newComps = formData.components.map((c: any) => c.type === type ? { ...c, ...data } : c);
    setFormData({ ...formData, components: newComps });
  };

  const getComp = (type: string) => formData.components.find((c: any) => c.type === type);

  const addButton = () => {
    const comps = [...formData.components];
    const btnCompIdx = comps.findIndex(c => c.type === 'BUTTONS');
    const existingBtnComp = btnCompIdx >= 0 ? comps[btnCompIdx] : null;
    const btnComp = existingBtnComp 
      ? { ...existingBtnComp, buttons: [...(existingBtnComp.buttons || [])] } 
      : { type: 'BUTTONS', buttons: [] as any[] };
    
    if (btnComp.buttons && btnComp.buttons.length >= 10) return toast.info('Max 10 buttons allowed');
    
    if (!btnComp.buttons) btnComp.buttons = [];
    btnComp.buttons.push({ type: 'QUICK_REPLY', text: 'New Button' });
    if (btnCompIdx >= 0) comps[btnCompIdx] = btnComp; else comps.push(btnComp);
    
    setFormData({ ...formData, components: comps });
  };

  const removeButton = (idx: number) => {
    const comps = [...formData.components];
    const btnCompIdx = comps.findIndex(c => c.type === 'BUTTONS');
    if (btnCompIdx === -1) return;
    const buttons = [...(comps[btnCompIdx].buttons || [])];
    buttons.splice(idx, 1);
    comps[btnCompIdx] = { ...comps[btnCompIdx], buttons };
    setFormData({ ...formData, components: comps });
  };

  const updateButton = (idx: number, data: any) => {
    const comps = [...formData.components];
    const btnCompIdx = comps.findIndex(c => c.type === 'BUTTONS');
    if (btnCompIdx === -1) return;
    const buttons = [...(comps[btnCompIdx].buttons || [])];
    buttons[idx] = { ...buttons[idx], ...data };
    comps[btnCompIdx] = { ...comps[btnCompIdx], buttons };
    setFormData({ ...formData, components: comps });
  };

  const handleSubmit = async () => {
    try {
      setCreating(true);
      // Clean up empty components
      const finalComps = formData.components.filter((c: any) => {
        if (c.type === 'HEADER' && c.format === 'TEXT' && !c.text) return false;
        if (c.type === 'HEADER' && c.format !== 'TEXT') return true; // Media header
        if (c.type === 'FOOTER' && !c.text) return false;
        if (c.type === 'BUTTONS' && (!c.buttons || c.buttons.length === 0)) return false;
        return true;
      });

      await api.post('/templates', { ...formData, components: finalComps });
      toast.success('Template submitted for approval');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create template');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="h-5 w-5" /></Button>
          <div className="h-6 w-px bg-gray-100" />
          <h2 className="font-bold text-gray-900 tracking-tight">Create Professional Template</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200'}`} />
            ))}
          </div>
          <Button 
            className="rounded-xl px-6 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 font-bold"
            disabled={creating}
            onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
          >
            {step === 3 ? (creating ? 'Submitting...' : 'Submit to Meta') : 'Next Step'}
            {step === 3 ? <Send className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Form Area */}
        <div className="flex-1 overflow-y-auto px-12 py-12 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-12 pb-24">
            
            {/* Step 1: Category */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">What type of message is this?</h3>
                  <p className="text-gray-500 font-medium">Meta uses categories to determine review time and pricing.</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`flex items-start gap-4 p-6 rounded-3xl border-2 transition-all duration-200 text-left ${formData.category === cat.id ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                    >
                      <div className={`p-4 rounded-2xl ${cat.color}`}><cat.icon className="h-6 w-6" /></div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{cat.label}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1 leading-relaxed">{cat.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="space-y-4 pt-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase ml-1">Template Name</label>
                    <Input 
                      placeholder="e.g. flash_sale_march" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      className="h-14 rounded-2xl text-lg font-bold border-gray-100 focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase ml-1">Language</label>
                    <div className="grid grid-cols-3 gap-3">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.id}
                          onClick={() => setFormData({ ...formData, language: lang.id })}
                          className={`h-12 rounded-2xl border-2 transition-all font-bold text-sm ${formData.language === lang.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Components */}
            {step === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Design your content</h3>
                  <p className="text-gray-500 font-medium font-inter">Add headers, body text, and interactive buttons.</p>
                </div>

                {/* Header Config */}
                <div className="space-y-4 p-8 rounded-[2rem] bg-gray-50/50 border border-gray-100">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase flex items-center gap-2 pr-2 leading-none h-4">
                      <Layout className="h-3.5 w-3.5 text-blue-500" /> Header <span className="text-[10px] text-gray-300">(Optional)</span>
                    </label>
                    <select 
                      className="text-xs font-bold text-blue-600 bg-transparent outline-none cursor-pointer"
                      value={getComp('HEADER')?.format}
                      onChange={(e) => updateComponent('HEADER', { format: e.target.value, text: '' })}
                    >
                      <option value="NONE">None</option>
                      <option value="TEXT">Text</option>
                      <option value="IMAGE">Image</option>
                      <option value="VIDEO">Video</option>
                      <option value="DOCUMENT">Document</option>
                    </select>
                  </div>
                  {getComp('HEADER')?.format === 'TEXT' && (
                    <Input 
                      placeholder="Add a catchy heading..."
                      value={getComp('HEADER')?.text}
                      onChange={(e) => updateComponent('HEADER', { text: e.target.value })}
                      className="h-12 rounded-xl bg-white border-gray-100"
                    />
                  )}
                  {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(getComp('HEADER')?.format || '') && (
                    <div className="h-32 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 bg-white text-gray-400">
                       <Plus className="h-6 w-6 opacity-30" />
                       <span className="text-xs font-bold opacity-60">Upload {getComp('HEADER')?.format}</span>
                    </div>
                  )}
                </div>

                {/* Body Config */}
                <div className="space-y-4 p-8 rounded-[2rem] bg-gray-50/50 border border-gray-100">
                   <label className="text-xs font-black text-gray-400 tracking-widest uppercase flex items-center gap-2 ml-1">
                      <Type className="h-3.5 w-3.5 text-green-500" /> Message Body
                   </label>
                   <textarea 
                      placeholder="Hello {{1}}, here is your code {{2}}!"
                      className="min-h-[160px] w-full p-6 rounded-2xl border border-gray-100 bg-white font-medium text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                      value={getComp('BODY')?.text}
                      onChange={(e) => updateComponent('BODY', { text: e.target.value })}
                   />
                   <div className="flex gap-2">
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-lg text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100"
                        onClick={() => {
                          const val = getComp('BODY')?.text || '';
                          const nextIdx = (val.match(/\{\{\d+\}\}/g)?.length || 0) + 1;
                          updateComponent('BODY', { text: val + `{{${nextIdx}}}` });
                        }}
                      >
                        + Add Variable
                      </Button>
                   </div>
                </div>

                {/* Footer Config */}
                <div className="space-y-4 p-8 rounded-[2rem] bg-gray-50/50 border border-gray-100">
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase flex items-center gap-2 ml-1 pr-2 leading-none h-4">
                      <Palette className="h-3.5 w-3.5 text-purple-500" /> Footer <span className="text-[10px] text-gray-300 ml-2">(Optional)</span>
                    </label>
                    <Input 
                      placeholder="Add small text under the message..."
                      value={getComp('FOOTER')?.text}
                      onChange={(e) => updateComponent('FOOTER', { text: e.target.value })}
                      className="h-12 rounded-xl bg-white border-gray-100"
                    />
                </div>
              </div>
            )}

            {/* Step 3: Buttons */}
            {step === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Interactive Buttons</h3>
                  <p className="text-gray-500 font-medium">Add buttons to increase engagement and response rates.</p>
                </div>

                <div className="space-y-4">
                  {getComp('BUTTONS')?.buttons.map((btn: any, idx: number) => (
                    <div key={idx} className="p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100 space-y-4 relative group">
                      <button 
                        onClick={() => removeButton(idx)}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex gap-4">
                        <select 
                          className="h-12 px-4 rounded-xl border border-gray-100 bg-white font-bold text-xs text-blue-600 outline-none w-48"
                          value={btn.type}
                          onChange={(e) => updateButton(idx, { type: e.target.value })}
                        >
                          <option value="QUICK_REPLY">Quick Reply</option>
                          <option value="URL">Visit Website</option>
                          <option value="PHONE_NUMBER">Call Number</option>
                          <option value="FLOW">Open Flow</option>
                        </select>
                        <Input 
                          placeholder="Button Text"
                          value={btn.text}
                          onChange={(e) => updateButton(idx, { text: e.target.value })}
                          className="h-12 rounded-xl bg-white border-gray-100 font-bold"
                        />
                      </div>
                      
                      {btn.type === 'URL' && (
                        <div className="space-y-2 animate-in fade-in duration-200">
                           <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase ml-1">Website URL</label>
                           <Input 
                             placeholder="https://example.com"
                             value={btn.url}
                             onChange={(e) => updateButton(idx, { url: e.target.value })}
                             className="h-11 rounded-xl bg-white border-gray-100"
                           />
                        </div>
                      )}

                      {btn.type === 'PHONE_NUMBER' && (
                        <div className="space-y-2 animate-in fade-in duration-200">
                           <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase ml-1">Phone Number (with code)</label>
                           <Input 
                             placeholder="+1234567890"
                             value={btn.phone_number}
                             onChange={(e) => updateButton(idx, { phone_number: e.target.value })}
                             className="h-11 rounded-xl bg-white border-gray-100"
                           />
                        </div>
                      )}

                      {btn.type === 'FLOW' && (
                        <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-200">
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase ml-1">Select Flow</label>
                             <select 
                               className="w-full h-11 px-4 rounded-xl border border-gray-100 bg-white font-medium text-xs outline-none"
                               value={btn.flow_id}
                               onChange={(e) => updateButton(idx, { flow_id: e.target.value })}
                             >
                               <option value="">Choose a flow...</option>
                               {flows.map(f => (
                                 <option key={f.id} value={f.id}>{f.name}</option>
                               ))}
                             </select>
                           </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {(!getComp('BUTTONS') || getComp('BUTTONS').buttons.length < 10) && (
                    <button 
                      onClick={addButton}
                      className="w-full h-20 rounded-[2rem] border-2 border-dashed border-gray-100 flex items-center justify-center gap-3 text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all font-bold group"
                    >
                      <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                      Add Interactive Button
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="w-[450px] bg-gray-50/80 border-l border-gray-100 flex items-center justify-center p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
          <TemplatePreview 
            category={formData.category}
            header={getComp('HEADER') as any}
            body={getComp('BODY')?.text || ''}
            footer={getComp('FOOTER')?.text}
            buttons={getComp('BUTTONS')?.buttons}
          />
        </div>
      </div>
    </div>
  );
}
