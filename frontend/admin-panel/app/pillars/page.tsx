'use client';

import React, { useState, useEffect } from 'react';
import { 
    Cpu, Activity, Zap, MessageSquare, Shield, Globe, 
    ArrowUpRight, ArrowDownRight, RefreshCw, Layers,
    TrendingUp, Database, Cloud, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import api from '@/lib/api';

export default function PillarsDashboard() {
    const [pillars, setPillars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pulse, setPulse] = useState(0);

    const fetchPillars = async () => {
        try {
            const res = await api.get('/admin/platform/pillars/health');
            setPillars(res.data.pillars || []);
        } catch (error) {
            console.error('Failed to sync pillars of intelligence');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPillars();
        const interval = setInterval(fetchPillars, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const pulseInterval = setInterval(() => setPulse(p => (p + 1) % 100), 50);
        return () => clearInterval(pulseInterval);
    }, []);

    if (loading) return (
        <div className="min-h-[600px] flex flex-col items-center justify-center p-10 bg-slate-50/50 rounded-[48px] border-2 border-slate-100/50">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-2xl shadow-blue-500/20" />
            <p className="text-[11px] font-black text-slate-400 tracking-[0.4em] uppercase mt-8">Establishing Synaptic Link...</p>
        </div>
    );

    const getPillarIcon = (id: string) => {
        switch(id) {
            case 'USER': return Globe;
            case 'KAFKA': return Zap;
            case 'ML': return Cpu;
            case 'ADMIN': return Shield;
            default: return Layers;
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">Global Nervous System Active</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter lowercase leading-none">Pillars of Intelligence<span className="text-blue-600">.</span></h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-4 flex items-center gap-2">
                        <Layers size={14} className="text-blue-500" /> Real-time Cross-Platform Orchestration Hub
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border-2 border-slate-50 shadow-xl shadow-slate-100/50">
                    <div className="flex flex-col items-end">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Sync Rate</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">100<span className="text-blue-600">%</span></p>
                    </div>
                </div>
            </div>

            {/* Pillar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <AnimatePresence mode="popLayout">
                    {pillars.map((pillar, i) => {
                        const Icon = getPillarIcon(pillar.id);
                        return (
                            <motion.div
                                key={pillar.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-white rounded-[48px] p-10 border-2 border-slate-50 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all relative overflow-hidden text-left"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-[100px] -mr-8 -mt-8" />
                                
                                <div className="flex items-center justify-between mb-10 relative">
                                    <div className={clsx(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
                                        pillar.status === 'operational' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-rose-500 shadow-rose-500/20'
                                    )}>
                                        <Icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className={clsx(
                                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                            pillar.status === 'operational' 
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                                : "bg-rose-50 text-rose-600 border-rose-100"
                                        )}>
                                            {pillar.status}
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-lg font-black text-slate-900 tracking-tight lowercase mb-2">{pillar.name}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Pillar Identifier: {pillar.id}_04</p>

                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    {Object.entries(pillar.metrics).map(([key, value]: [any, any]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">{key.replace(/([A-Z])/g, ' $1')}</span>
                                            <span className="text-[12px] font-black text-slate-900 tabular-nums lowercase">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Central Intelligence Bridge */}
            <div className="bg-[#0F172A] rounded-[56px] p-12 text-left relative overflow-hidden shadow-2xl">
                 {/* Neural Pulse Lines */}
                 <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                 <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
                 
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
                    <div className="lg:col-span-4 space-y-8">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter lowercase leading-tight">Neural Sync Interface<span className="text-blue-500">_</span></h2>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-4">Cross-Service Event Bridge v2.5</p>
                        </div>
                        
                        <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Kafka Throughput</span>
                                <Zap size={14} className="text-blue-400" />
                            </div>
                            <div className="flex items-end gap-3 mb-8">
                                <span className="text-4xl font-black text-white tracking-tighter">850</span>
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter pb-1.5">events / sec</span>
                            </div>
                            <div className="flex gap-1 h-12 items-end">
                                {[...Array(30)].map((_, i) => (
                                    <motion.div 
                                        key={i}
                                        animate={{ height: Math.random() * 100 + "%" }}
                                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.05 }}
                                        className="flex-1 bg-blue-500/20 rounded-full min-h-[4px]"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-white/5 rounded-[48px] p-10 border border-white/5 backdrop-blur-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-lg font-black text-white tracking-tight lowercase flex items-center gap-3">
                                <Activity className="text-blue-500" /> Real-time Anomaly Stream
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Listening</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { t: '14:22:04', e: 'ML_INFERENCE_COMPLETE', p: 'Tenant_4412_A', m: 'High confidence usage pattern detected' },
                                { t: '14:21:58', e: 'KAFKA_ROUTING_SUCCESS', p: 'Topic_Usage_Events', m: 'Event bridge parity maintained' },
                                { t: '14:21:40', e: 'RISK_SCORE_REDUCTION', p: 'Tenant_8892_B', m: 'Behavioral profile normalized' }
                            ].map((log, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-6 p-5 rounded-[24px] hover:bg-white/5 transition-colors group cursor-default border border-transparent hover:border-white/5"
                                >
                                    <span className="text-[10px] font-black text-blue-500 tabular-nums">{log.t}</span>
                                    <div className="h-1.5 w-1.5 bg-blue-500/20 rounded-full group-hover:bg-blue-500 transition-colors" />
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-white uppercase tracking-tighter">{log.e}</span>
                                        <span className="text-[10px] font-bold text-slate-500 lowercase mt-1 tracking-tight">{log.p} — {log.m}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                 </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-6 p-8 bg-blue-50 rounded-[32px] border-2 border-blue-100/50">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl shadow-blue-200/50">
                    <Shield size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight lowercase">Secure Orchestration Mode Active</h4>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Cross-pillar communications are encrypted and audited via the global administrative hub protocol.</p>
                </div>
            </div>
        </div>
    );
}
