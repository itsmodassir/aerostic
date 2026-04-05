"use client"

import React, { useEffect, useState } from 'react';
import {
    Shield, AlertTriangle, Key, Activity, TrendingUp, Users,
    ChevronRight, Lock, Unlock, RefreshCw, Zap, Bug,
    ShieldAlert, ShieldCheck, ShieldOff, BrainCircuit, ActivitySquare
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CoordinatedAttackHeatmap } from './components/attack-heatmap';

export default function RiskDashboard() {
    const [platformStats, setPlatformStats] = useState({
        overallScore: 0,
        highRiskTenants: 0,
        suspendedApiKeys: 0,
        dynamicThreshold: 80,
    });

    const [tenantRisks, setTenantRisks] = useState<any[]>([]);
    const [securityEvents, setSecurityEvents] = useState<any[]>([]);
    const [trends, setTrends] = useState<any[]>([]);
    const [heatmapData, setHeatmapData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // WebSocket Integration
    useEffect(() => {
        // In production, the URL would be configured in environment variables
        const socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/risk-stream`, {
            transports: ['websocket'],
        });

        socket.on('platform_risk_update', (data) => {
            setPlatformStats(prev => ({ ...prev, ...data }));
        });

        socket.on('tenant_risk_update', (update) => {
            setTenantRisks(prev => {
                const index = prev.findIndex(t => t.tenantId === update.tenantId);
                if (index > -1) {
                    const newRisks = [...prev];
                    newRisks[index] = { ...newRisks[index], ...update };
                    return newRisks.sort((a, b) => b.riskScore - a.riskScore);
                }
                return [update, ...prev].sort((a, b) => b.riskScore - a.riskScore).slice(0, 50);
            });
        });

        socket.on('security_alert', (alert) => {
            setSecurityEvents(prev => [alert, ...prev].slice(0, 20));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Initial Fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const opts = { credentials: 'include' as const };
                const [platformRes, tenantRes, eventRes, trendRes, heatmapRes] = await Promise.all([
                    fetch('/api/v1/admin/risk/platform', opts),
                    fetch('/api/v1/admin/risk/tenants?limit=10', opts),
                    fetch('/api/v1/admin/risk/events?limit=20', opts),
                    fetch('/api/v1/admin/risk/trends?hours=24', opts),
                    fetch('/api/v1/admin/risk/clusters/heatmap?hours=24', opts)
                ]);

                const platform = platformRes.ok ? await platformRes.json() : { current: platformStats };
                const tenants = tenantRes.ok ? await tenantRes.json() : [];
                const events = eventRes.ok ? await eventRes.json() : [];
                const trendData = trendRes.ok ? await trendRes.json() : [];
                const heatmap = heatmapRes.ok ? await heatmapRes.json() : [];

                setPlatformStats(platform.current || platform);
                setTenantRisks(Array.isArray(tenants) ? tenants : (tenants.data || []));
                setSecurityEvents(Array.isArray(events) ? events : (events.data || []));
                setTrends(Array.isArray(trendData) ? trendData : (trendData.data || []));
                setHeatmapData(Array.isArray(heatmap) ? heatmap : (heatmap.data || []));
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch security data', err);
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-red-500';
        if (score >= 50) return 'text-amber-500';
        return 'text-emerald-500';
    };

    const getBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'critical': return 'destructive';
            case 'high_risk': return 'destructive';
            case 'warning': return 'secondary';
            default: return 'outline';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Security Command Center</h1>
                    <p className="text-muted-foreground">Real-time platform risk telemetry and ML-powered anomaly detection.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                        <ActivitySquare className="w-3 h-3 mr-1" /> System Guard Active
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                        <BrainCircuit className="w-3 h-3 mr-1" /> RL Optimizer Running
                    </Badge>
                </div>
            </div>

            {/* Platform Overview Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Overall Score */}
                <Card className="bg-slate-950 border-slate-800 text-white overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Shield className="w-16 h-16" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                            Platform Risk Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-black text-white">{platformStats.overallScore.toFixed(0)}</div>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${platformStats.overallScore}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full ${platformStats.overallScore > 75 ? 'bg-red-500' : platformStats.overallScore > 40 ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-500 tracking-tighter">MAX 100</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">High Risk Tenants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold flex items-center gap-3">
                            {platformStats.highRiskTenants}
                            {platformStats.highRiskTenants > 0 && (
                                <Badge variant="destructive" className="animate-pulse">ALERT</Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Suspensions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{platformStats.suspendedApiKeys}</div>
                    </CardContent>
                </Card>

                <Card className="bg-indigo-600 text-white border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Adaptive Threshold</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold flex items-center gap-2">
                            {platformStats.dynamicThreshold}
                            <Zap className="w-5 h-5 fill-white" />
                        </div>
                        <p className="text-[10px] mt-1 opacity-70 italic font-medium">Auto-adjusted by Deep RL based on attack velocity</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts & Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Trend Chart */}
                <Card className="lg:col-span-2 shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Risk Evolution</CardTitle>
                            <CardDescription>Aggregate platform risk score over the last 24 hours</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Activity className="w-3 h-3 text-indigo-500" />
                                <span className="text-[10px] font-bold text-muted-foreground">REAL-TIME FEED</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[250px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends}>
                                <defs>
                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="createdAt"
                                    hide
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="overallScore"
                                    stroke="#6366f1"
                                    fillOpacity={1}
                                    fill="url(#colorRisk)"
                                    strokeWidth={3}
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* New Heatmap Integration */}
                <div className="lg:col-span-2">
                    <CoordinatedAttackHeatmap data={heatmapData} />
                </div>

                {/* Security Alerts List */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Security Events</CardTitle>
                        <CardDescription>Live feed of automated mitigation actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {securityEvents.length > 0 ? securityEvents.map((event, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 items-start hover:shadow-md transition-shadow cursor-default"
                                    >
                                        <div className={`mt-0.5 p-1.5 rounded-full ${event.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {event.severity === 'CRITICAL' ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{event.type}</span>
                                                <span className="text-[10px] font-bold text-slate-400">NOW</span>
                                            </div>
                                            <div className="text-xs font-bold text-slate-800 leading-snug">{event.message}</div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center h-full opacity-30">
                                        <ShieldCheck className="w-12 h-12 mb-2" />
                                        <p className="text-sm font-medium">No threats detected</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tenant Table */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle>Tenant Risk Monitoring</CardTitle>
                    <CardDescription>Active visibility into hierarchical risk aggregation</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-[300px]">Tenant Fingerprint</TableHead>
                                <TableHead>Risk Score</TableHead>
                                <TableHead>Mitigation Status</TableHead>
                                <TableHead>Last Signal</TableHead>
                                <TableHead className="text-right">Admin Controls</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenantRisks.map((tenant) => (
                                <TableRow key={tenant.tenantId} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-mono text-[11px] font-bold text-slate-500">
                                        {tenant.tenantId}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-black ${getScoreColor(tenant.currentScore)}`}>
                                                {tenant.currentScore.toFixed(1)}
                                            </span>
                                            <div className="h-1 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${tenant.currentScore > 75 ? 'bg-red-500' : tenant.currentScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${tenant.currentScore}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getBadgeVariant(tenant.status)} className="font-bold text-[10px] uppercase tracking-tighter">
                                            {tenant.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-[10px] font-bold text-slate-400">
                                        {new Date(tenant.lastIncidentAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {tenant.status !== 'normal' && (
                                                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                                    <ShieldCheck className="w-3 h-3 mr-1" /> RESTORE
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold">
                                                OVERRIDE
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
