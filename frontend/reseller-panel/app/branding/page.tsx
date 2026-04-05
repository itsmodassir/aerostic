'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Globe, Palette, Link as LinkIcon, Mail,
    Save, ArrowLeft, CheckCircle2, Upload,
    Image as ImageIcon, RefreshCcw, Layout as LayoutIcon,
    ExternalLink, AlertCircle, Building2, CreditCard,
    Sparkles, ShieldCheck, Activity, Zap, Layers, 
    MousePointer2, Sidebar, Maximize2, Users2, Settings
} from 'lucide-react';
import api from '@/lib/api';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

export default function ResellerBrandingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [membership, setMembership] = useState<any>(null);

    const [branding, setBranding] = useState({
        brandName: '',
        primaryColor: '#6366F1',
        logo: '',
        favicon: '',
        domain: '',
        supportEmail: '',
        paymentGateway: {
            razorpayKeyId: '',
            razorpayKeySecret: ''
        }
    });

    useEffect(() => {
        fetchBranding();
    }, []);

    const fetchBranding = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/membership');
            if (res.data) {
                setMembership(res.data);
                if (res.data.branding) {
                    setBranding({
                        brandName: res.data.branding.brandName || '',
                        primaryColor: res.data.branding.primaryColor || '#6366F1',
                        logo: res.data.branding.logo || '',
                        favicon: res.data.branding.favicon || '',
                        domain: res.data.branding.domain || '',
                        supportEmail: res.data.branding.supportEmail || '',
                        paymentGateway: res.data.branding.paymentGateway || {
                            razorpayKeyId: '',
                            razorpayKeySecret: ''
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch branding', error);
            toast.error('Sync failure: Identity protocols unavailable');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const toastId = toast.loading('Synchronizing Brand Identity...');
        try {
            await api.patch('/reseller/branding', branding);
            toast.success('Identity Optimized Successfully', { id: toastId });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Sync failure: Identity mismatch', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-2xl" />
            </div>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
            {/* Header Section - Aerostic Premium */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                         <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">Identity Protocol v2.0</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter lowercase leading-none">White Label Lab<span className="text-indigo-600">.</span></h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2 italic">
                         <Palette size={12} className="text-indigo-500" /> customize distributed distributor endpoints
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                         onClick={fetchBranding}
                         className="px-6 py-3 bg-white border-2 border-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest shadow-sm"
                    >
                         Discard Changes_
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="group flex items-center gap-2 px-8 py-3 bg-[#0F172A] text-white rounded-[20px] shadow-xl shadow-indigo-500/10 hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                         {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={18} strokeWidth={3} />}
                         <span className="text-[10px] font-black uppercase tracking-widest">{saving ? 'Synchronizing...' : 'Finalize Branding_'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Configuration Lab */}
                <form onSubmit={handleSave} className="lg:col-span-7 space-y-8">
                    {/* Visual Identity Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[40px] border-2 border-slate-50 overflow-hidden shadow-sm relative group"
                    >
                        <div className="p-8 border-b-2 border-slate-50 bg-slate-50/30 flex items-center gap-4">
                             <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-100 shadow-sm transition-transform group-hover:scale-110">
                                  <Sparkles size={20} strokeWidth={2.5} />
                             </div>
                             <h3 className="text-lg font-black text-slate-900 lowercase italic">Visual_Identity<span className="text-indigo-600">_</span></h3>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Identifier</label>
                                    <input
                                        type="text"
                                        value={branding.brandName}
                                        onChange={(e) => setBranding({ ...branding, brandName: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[20px] text-sm font-bold outline-none transition-all shadow-inner placeholder:text-slate-200"
                                        placeholder="Aerostic WhiteLabel"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Vector (Color)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={branding.primaryColor}
                                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                            className="w-14 h-14 rounded-2xl cursor-pointer border-2 border-slate-50 p-2 bg-white shadow-sm"
                                        />
                                        <input
                                            type="text"
                                            value={branding.primaryColor}
                                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                            className="flex-1 px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[20px] font-mono text-xs font-black uppercase tracking-widest outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Node (Logo URL)</label>
                                    <div className="relative group/logo">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                            {branding.logo ? <img src={branding.logo} className="w-full h-full object-contain" /> : <ImageIcon className="w-4 h-4 text-slate-200" />}
                                        </div>
                                        <input
                                            type="text"
                                            value={branding.logo}
                                            onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
                                            className="w-full pl-18 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[20px] text-xs font-bold outline-none transition-all shadow-inner"
                                            placeholder="https://vector.io/logo.png"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Browser Vector (Favicon)</label>
                                    <div className="relative group/fav">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                                            {branding.favicon ? <img src={branding.favicon} className="w-4 h-4 object-contain" /> : <Globe className="w-4 h-4 text-slate-200" />}
                                        </div>
                                        <input
                                            type="text"
                                            value={branding.favicon}
                                            onChange={(e) => setBranding({ ...branding, favicon: e.target.value })}
                                            className="w-full pl-18 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[20px] text-xs font-bold outline-none transition-all shadow-inner"
                                            placeholder="https://vector.io/favicon.ico"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Domain & Support Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[40px] border-2 border-slate-50 overflow-hidden shadow-sm relative group"
                    >
                        <div className="p-8 border-b-2 border-slate-50 bg-slate-50/30 flex items-center gap-4">
                             <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 border border-purple-100 shadow-sm transition-transform group-hover:scale-110">
                                  <LayoutIcon size={20} strokeWidth={2.5} />
                             </div>
                             <h3 className="text-lg font-black text-slate-900 lowercase italic">Protocol_Connectivity<span className="text-purple-600">_</span></h3>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom Hub Domain</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-500 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            value={branding.domain}
                                            onChange={(e) => setBranding({ ...branding, domain: e.target.value })}
                                            className="w-full pl-14 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[20px] text-sm font-bold outline-none transition-all shadow-inner"
                                            placeholder="hub.youragency.com"
                                        />
                                        <ExternalLink className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200" size={14} />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1 italic mt-2">CNAME PROTOCOL: POINT TO app.aerostic.io_</p>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Connectivity (Email)</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-500 transition-colors" size={16} />
                                        <input
                                            type="email"
                                            value={branding.supportEmail}
                                            onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[20px] text-sm font-bold outline-none transition-all shadow-inner"
                                            placeholder="support@agency.io"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-amber-50/50 rounded-[32px] border border-amber-100 flex items-start gap-4">
                                <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" strokeWidth={3} />
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Global Switcher Verification</p>
                                    <p className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest leading-relaxed">SSL protocols are automatically generated upon CNAME propagation. Ensure DNS identity before final deployment.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Payment Gateway Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-[40px] border-2 border-slate-50 overflow-hidden shadow-sm relative group"
                    >
                        <div className="p-8 border-b-2 border-slate-50 bg-slate-50/30 flex items-center gap-4">
                             <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100 shadow-sm transition-transform group-hover:scale-110">
                                  <CreditCard size={20} strokeWidth={2.5} />
                             </div>
                             <h3 className="text-lg font-black text-slate-900 lowercase italic">Distributed_Billing<span className="text-emerald-600">_</span></h3>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razorpay Hub ID</label>
                                    <input
                                        type="text"
                                        value={branding.paymentGateway.razorpayKeyId}
                                        onChange={(e) => setBranding({
                                            ...branding,
                                            paymentGateway: { ...branding.paymentGateway, razorpayKeyId: e.target.value }
                                        })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[20px] text-xs font-black outline-none transition-all shadow-inner placeholder:text-slate-200"
                                        placeholder="rzp_live_abc123"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razorpay Security Vector</label>
                                    <input
                                        type="password"
                                        value={branding.paymentGateway.razorpayKeySecret}
                                        onChange={(e) => setBranding({
                                            ...branding,
                                            paymentGateway: { ...branding.paymentGateway, razorpayKeySecret: e.target.value }
                                        })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[20px] text-xs font-black outline-none transition-all shadow-inner placeholder:text-slate-200"
                                        placeholder="••••••••••••"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic text-center">Enable direct sub-tenant monetization via centralized Razorpay infrastructure_</p>
                        </div>
                    </motion.div>
                </form>

                {/* Simulation Panel */}
                <div className="lg:col-span-5 sticky top-32 h-fit">
                    <div className="bg-slate-900 rounded-[56px] p-2 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)] border-[8px] border-slate-800 relative group overflow-hidden">
                         <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 blur-[100px] -z-10 group-hover:scale-150 transition-transform duration-1000" />
                         
                         {/* Simulation Header */}
                         <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Identity Simulator v2.0</h4>
                             </div>
                             <div className="flex gap-1.5">
                                 <div className="w-2.5 h-2.5 rounded-full bg-rose-500/30 border border-rose-500/50" />
                                 <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/50" />
                                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
                             </div>
                         </div>

                         {/* Mini Dashboard Preview */}
                         <div className="bg-slate-950/50 m-4 rounded-[40px] border border-white/5 shadow-2xl h-[560px] flex overflow-hidden">
                             {/* Mini Sidebar */}
                             <div className="w-20 border-r border-white/5 flex flex-col items-center py-8 gap-6 shrink-0">
                                 <motion.div 
                                     animate={{ backgroundColor: branding.primaryColor || '#6366F1' }}
                                     className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xl relative group-hover:rotate-12 transition-transform duration-500"
                                 >
                                      {branding.logo ? <img src={branding.logo} className="w-6 h-6 object-contain" /> : <Layers size={18} className="text-white" />}
                                 </motion.div>
                                 <div className="space-y-4">
                                     {[Activity, LayoutIcon, Users2, Zap, Settings].map((Icn, idx) => (
                                         <div key={idx} className={clsx("p-3 rounded-xl transition-colors", idx === 0 ? "bg-white/5 text-white" : "text-white/20")}>
                                             <Icn size={16} />
                                         </div>
                                     ))}
                                 </div>
                                 <div className="mt-auto p-3 text-rose-500/40 translate-y-2">
                                     <RefreshCcw size={16} />
                                 </div>
                             </div>

                             {/* Mini Content */}
                             <div className="flex-1 p-8 space-y-8 bg-slate-900/40 relative">
                                 <div className="flex items-center justify-between">
                                     <div className="space-y-1.5">
                                         <motion.h5 
                                            animate={{ color: branding.primaryColor || '#6366F1' }}
                                            className="text-lg font-black tracking-tight leading-none italic"
                                         >
                                            {branding.brandName || 'Aerostic Platform'}
                                         </motion.h5>
                                         <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Workspace Overview protocol</p>
                                     </div>
                                     <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                         <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                         <span className="text-[7px] text-white/40 font-black uppercase tracking-widest">Synced_</span>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="h-28 bg-white/5 border border-white/5 rounded-[24px] p-4 flex flex-col justify-between">
                                          <div className="w-6 h-6 bg-white/5 rounded-lg border border-white/5" />
                                          <div className="space-y-1.5">
                                               <div className="w-12 h-3 bg-white/10 rounded-full" />
                                               <div className="w-8 h-2 bg-white/5 rounded-full" />
                                          </div>
                                     </div>
                                     <div className="h-28 bg-white/5 border border-white/5 rounded-[24px] p-4 flex flex-col justify-between">
                                          <div className="w-6 h-6 bg-white/5 rounded-lg border border-white/5" />
                                          <div className="space-y-1.5">
                                               <div className="w-14 h-3 bg-white/10 rounded-full" />
                                               <div className="w-10 h-2 bg-white/5 rounded-full" />
                                          </div>
                                     </div>
                                 </div>

                                 <div className="h-44 bg-white/5 border border-white/5 rounded-[32px] p-6 relative group/graph">
                                      <div className="flex items-center justify-between mb-4">
                                           <div className="w-20 h-2 bg-white/10 rounded-full" />
                                           <Maximize2 size={10} className="text-white/10" />
                                      </div>
                                      <div className="absolute inset-x-6 bottom-6 flex items-end gap-1.5 justify-between">
                                          {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                              <motion.div 
                                                key={i} 
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%`, backgroundColor: i === 3 ? (branding.primaryColor || '#6366F1') : '#ffffff10' }}
                                                className="flex-1 rounded-t-sm transition-colors duration-500"
                                              />
                                          ))}
                                      </div>
                                 </div>

                                 <MousePointer2 className="absolute right-12 bottom-12 text-indigo-500 animate-bounce" size={20} />
                             </div>
                         </div>

                         <div className="p-8 text-center bg-white/5">
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] leading-relaxed italic">
                                   Simulated end-user experience across distributed client ecosystems
                              </p>
                         </div>
                    </div>
                </div>
            </div>
            </div>
        </Layout>
    );
}
