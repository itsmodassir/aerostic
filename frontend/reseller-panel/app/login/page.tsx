'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { 
    Crown, ArrowRight, Mail, Lock, Eye, EyeOff, 
    ShieldCheck, Zap, Sparkles, Gem, Globe,
    ChevronRight, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { setActiveWorkspaceContext } from '@/lib/workspace-context';

function isAllowedResellerRole(role?: string | null) {
    return role === 'super_admin' || role === 'platform_admin' || role === 'reseller_admin' || role === 'admin';
}

export default function PartnerLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [branding, setBranding] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch branding for the current host (Distributor Identity)
        const host = window.location.host;
        fetch(`/api/v1/auth/branding?host=${host}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data) setBranding(data);
            })
            .catch(err => console.error('Branding fetch failed:', err));
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Synchronizing Partner Session...');
        try {
            const res = await api.post('/auth/login', { email, password });
            
            if (res.data.user) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
                
                // Enforce Reseller Role Only
                if (!isAllowedResellerRole(res.data.user.role)) {
                    toast.error('Access Denied: Partner Credentials Required', { id: toastId });
                    setLoading(false);
                    return;
                }
            }

            setActiveWorkspaceContext({
                id: res.data.workspaceId,
                slug: res.data.workspaceSlug,
            });

            toast.success('Authorized: Welcome to Partner Hub', { id: toastId });
            router.replace('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Authentication Protocol Failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased overflow-hidden selection:bg-indigo-100 italic">
            {/* Left Side - Intelligence Visual */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-purple-600/10" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10 p-20 max-w-2xl space-y-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4"
                    >
                        <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40">
                            <Crown size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight lowercase">Aerostic Enterprise<span className="text-indigo-500">_</span></h2>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Global Distribution Protocol</p>
                        </div>
                    </motion.div>

                    <div className="space-y-8">
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl font-black text-white tracking-tighter leading-none"
                        >
                            Orchestrate Distributed <br />
                            <span className="text-indigo-500 italic">Intelligence.</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 font-medium text-lg max-w-md leading-relaxed"
                        >
                            Access the global control manifest. Monitor sub-tenant ecosystems, white-label identity vectors, and network-wide logical flows.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 pt-10">
                        {[
                            { icon: ShieldCheck, title: 'Secure Vector Auth', desc: 'Enterprise-grade encryption for reseller sessions.' },
                            { icon: Target, title: 'Multi-Tenant Scale', desc: 'Monitor 10,000+ distributed workspaces.' },
                            { icon: Gem, title: 'White-Label Branding', desc: 'Sync identity across global infrastructure.' }
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="flex gap-6 group"
                            >
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-indigo-600 transition-colors">
                                    <item.icon className="text-white" size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white lowercase italic">{item.title}</h4>
                                    <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Login Manifesto */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 relative">
                {/* Mobile Header */}
                <div className="lg:hidden absolute top-12 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                        <Crown size={24} />
                    </div>
                    <span className="font-black text-xl italic lowercase">Aerostic_Partner_</span>
                </div>

                <div className="w-full max-w-md space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="space-y-4 text-center lg:text-left">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter lowercase leading-none">Partner Access Hub<span className="text-indigo-600">.</span></h3>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center justify-center lg:justify-start gap-2">
                             <Target size={12} className="text-indigo-500" /> verify distributor credentials to proceed_
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ecosystem Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                    <input 
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="partner@aerostic.io"
                                        className="w-full pl-16 pr-8 py-5 bg-white border-2 border-slate-50 rounded-[28px] text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 group">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secure Access Key</label>
                                    <button type="button" className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:underline">Forgot Vector?</button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                    <input 
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full pl-16 pr-16 py-5 bg-white border-2 border-slate-50 rounded-[28px] text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <button 
                                disabled={loading}
                                type="submit"
                                className="w-full h-18 bg-[#0F172A] text-white rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group/btn shadow-2xl shadow-indigo-500/10"
                            >
                                <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                                <div className="relative z-10 flex items-center justify-center gap-4">
                                    {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : 'verify identity_'}
                                    <ChevronRight size={18} strokeWidth={3} className={clsx("transition-transform group-hover/btn:translate-x-1", loading && "hidden")} />
                                </div>
                            </button>

                            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                Restricted distributive console. <br />
                                Authorized distributor credentials required by protocol_
                            </p>
                        </div>
                    </form>
                </div>

                <div className="absolute bottom-12 flex items-center gap-8 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                    <span>v4.2.0-partner_cloud</span>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    <span>aimstors solution inc.</span>
                </div>
            </div>
        </div>
    );
}
