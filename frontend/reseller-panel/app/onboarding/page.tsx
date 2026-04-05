'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
    ShieldCheck, Building2, CreditCard, Sparkles, 
    ArrowRight, CheckCircle2, Globe, Mail, 
    Smartphone, FileText, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ResellerOnboarding() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        brandName: '',
        supportEmail: '',
        gstNumber: '',
        panNumber: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        agreeToTerms: false
    });

    const handleComplete = async () => {
        setLoading(true);
        const toastId = toast.loading('Finalizing Partner Compliance Registry...');
        try {
            await api.patch('/reseller/branding', {
                brandName: formData.brandName,
                supportEmail: formData.supportEmail,
                compliance: {
                    gst: formData.gstNumber,
                    pan: formData.panNumber,
                    bank: {
                        name: formData.bankName,
                        account: formData.accountNumber,
                        ifsc: formData.ifscCode
                    }
                }
            });
            toast.success('Onboarding Successful: Ecosystem Activated', { id: toastId });
            router.push('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Compliance synchronisation failure', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 font-sans antialiased italic">
            <div className="w-full max-w-4xl bg-white rounded-[56px] shadow-2xl border-2 border-slate-50 overflow-hidden flex flex-col lg:flex-row h-full min-h-[700px]">
                {/* Left Side - Progress Manifesto */}
                <div className="lg:w-1/3 bg-[#0F172A] p-12 text-white relative flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent pointer-none" />
                    
                    <div className="relative z-10 space-y-12 h-full flex flex-col">
                         <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
                             < ShieldCheck size={28} strokeWidth={2.5} />
                         </div>

                         <div className="space-y-4">
                             <h2 className="text-2xl font-black tracking-tight leading-none lowercase">Compliance_Board<span className="text-indigo-500">_</span></h2>
                             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-relaxed">Phase {step} of 3: Authorized Distributor Activation</p>
                         </div>

                         <nav className="space-y-10 flex-1">
                             {[
                                 { id: 1, label: 'Identity Vector', desc: 'Brand & Support Protocols' },
                                 { id: 2, label: 'Taxation Registry', desc: 'GST & Compliance Sync' },
                                 { id: 3, label: 'Billing Endpoint', desc: 'Secure Revenue Channel' }
                             ].map((s) => (
                                 <div key={s.id} className={clsx(
                                     "flex items-center gap-4 transition-all duration-500",
                                     step >= s.id ? "opacity-100" : "opacity-30 grayscale"
                                 )}>
                                     <div className={clsx(
                                         "w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs",
                                         step === s.id ? "border-indigo-500 bg-indigo-500 text-white" : 
                                         step > s.id ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-700 text-slate-500"
                                     )}>
                                         {step > s.id ? <CheckCircle2 size={16} strokeWidth={3} /> : s.id}
                                     </div>
                                     <div>
                                         <p className="text-sm font-black lowercase italic leading-none">{s.label}</p>
                                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{s.desc}</p>
                                     </div>
                                 </div>
                             ))}
                         </nav>

                         <div className="pt-10 flex items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest border-t border-white/5">
                             <span>Ecosystem_Ready</span>
                             <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                             <span>v1.2.9</span>
                         </div>
                    </div>
                </div>

                {/* Right Side - Form Vectors */}
                <div className="flex-1 p-16 flex flex-col justify-center bg-white relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter lowercase leading-none">Identity Architecture<span className="text-indigo-600">.</span></h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Define your distributor brand protocols</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Distributor Brand Name</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                                <input 
                                                    value={formData.brandName}
                                                    onChange={e => setFormData({...formData, brandName: e.target.value})}
                                                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[28px] text-slate-900 font-bold outline-none transition-all shadow-inner"
                                                    placeholder="e.g. Quantum Solutions"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Connectivity Endpoint (Support Email)</label>
                                            <div className="relative">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                                <input 
                                                    value={formData.supportEmail}
                                                    onChange={e => setFormData({...formData, supportEmail: e.target.value})}
                                                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[28px] text-slate-900 font-bold outline-none transition-all shadow-inner"
                                                    placeholder="support@quantum.digital"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setStep(2)}
                                    className="w-full h-18 bg-[#0F172A] text-white rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 group hover:shadow-2xl hover:shadow-indigo-500/20 active:scale-[0.98] transition-all"
                                >
                                    Proceed to Compliance <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter lowercase leading-none">Compliance Registry<span className="text-indigo-600">.</span></h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Government identity & taxation synchronization</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Identification Number</label>
                                            <div className="relative">
                                                <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                                <input 
                                                    value={formData.gstNumber}
                                                    onChange={e => setFormData({...formData, gstNumber: e.target.value})}
                                                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[28px] text-slate-900 font-bold outline-none transition-all shadow-inner"
                                                    placeholder="27XXXXX0000X1Z5"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PAN Vector (Business/Owner)</label>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                                <input 
                                                    value={formData.panNumber}
                                                    onChange={e => setFormData({...formData, panNumber: e.target.value})}
                                                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[28px] text-slate-900 font-bold outline-none transition-all shadow-inner"
                                                    placeholder="ABCDE1234F"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="flex-1 h-18 bg-slate-50 text-slate-400 rounded-[32px] font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-colors">Protocol_Back</button>
                                    <button 
                                        onClick={() => setStep(3)}
                                        className="flex-[2] h-18 bg-[#0F172A] text-white rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 group hover:shadow-2xl hover:shadow-indigo-500/20 active:scale-[0.98] transition-all"
                                    >
                                        Deploy Billing Logic <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter lowercase leading-none">Billing Endpoint<span className="text-indigo-600">.</span></h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Authorized revenue transmission channel</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Holder Name</label>
                                            <input 
                                                value={formData.bankName}
                                                onChange={e => setFormData({...formData, bankName: e.target.value})}
                                                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[28px] text-slate-900 font-bold outline-none transition-all shadow-inner"
                                                placeholder="e.g. MODASSIR SOLUTIONS INC"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 group">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Sequence (Number)</label>
                                                <input 
                                                    value={formData.accountNumber}
                                                    onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[28px] text-slate-900 font-bold outline-none transition-all shadow-inner"
                                                    placeholder="000012345678"
                                                />
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IFSC Vector (Code)</label>
                                                <input 
                                                    value={formData.ifscCode}
                                                    onChange={e => setFormData({...formData, ifscCode: e.target.value})}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[28px] text-slate-900 font-bold outline-none transition-all shadow-inner"
                                                    placeholder="SBIN0000123"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div 
                                        className="flex items-center gap-4 p-6 bg-slate-50/50 rounded-2xl cursor-pointer select-none border border-slate-100"
                                        onClick={() => setFormData({...formData, agreeToTerms: !formData.agreeToTerms})}
                                    >
                                        <div className={clsx(
                                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                            formData.agreeToTerms ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
                                        )}>
                                            {formData.agreeToTerms && <CheckCircle2 size={16} strokeWidth={3} />}
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">I authorize global network redistribution protocol v1.4_</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(2)} className="flex-1 h-18 bg-slate-50 text-slate-400 rounded-[32px] font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-colors">Protocol_Back</button>
                                    <button 
                                        disabled={loading || !formData.agreeToTerms}
                                        onClick={handleComplete}
                                        className="flex-[2] h-18 bg-[#0F172A] text-white rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 group hover:shadow-2xl hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={18} strokeWidth={3} className="text-indigo-400" />}
                                        {loading ? 'Executing Onboarding...' : 'Finalize Activation_'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function clsx(...args: any[]) {
    return args.filter(Boolean).join(' ');
}
