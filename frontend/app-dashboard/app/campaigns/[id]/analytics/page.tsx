'use client';

import React, { use, useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line,
  ComposedChart
} from 'recharts';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  CheckCircle2, 
  DollarSign, 
  Percent,
  Calendar,
  Filter,
  Download,
  Info,
  ChevronRight,
  Target,
  Zap,
  Clock
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/Progress";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// --- Types ---
interface AnalyticsMetrics {
  totalCost: number;
  totalRevenue: number;
  roi: number;
  deliveryRate: number;
  readRate: number;
  conversionRate: number;
  costPerConversion: number;
}

interface FunnelData {
  name: string;
  value: number;
}

interface TimelineData {
  time: string;
  sent: number;
  read: number;
  conversions: number;
}

interface ABTestData {
  name: string;
  sent: number;
  delivered: number;
  read: number;
  deliveryRate: string;
  readRate: string;
}

interface HeatmapData {
  day: number;
  hour: number;
  value: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CampaignAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [abTestData, setAbTestData] = useState<ABTestData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchHeatmap = useCallback(async () => {
      try {
          const res = await api.get(`/campaigns/${id}/analytics/heatmap`, {
              params: { tags: selectedTags.join(",") }
          });
          setHeatmapData(res.data);
      } catch (err) {
          console.error("Failed to fetch segmented heatmap", err);
      }
  }, [id, selectedTags]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, timelineRes, abRes] = await Promise.all([
          api.get(`/campaigns/${id}/analytics`),
          api.get(`/campaigns/${id}/analytics/timeline`),
          api.get(`/campaigns/${id}/analytics/ab-test`)
        ]);

        setMetrics(statsRes.data.metrics);
        setFunnelData(statsRes.data.funnel);
        setTimelineData(timelineRes.data);
        setAbTestData(abRes.data);
        await fetchHeatmap();
      } catch (err) {
        toast.error('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
      if (!loading) fetchHeatmap();
  }, [selectedTags, fetchHeatmap]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Analyzing campaign performance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          Back to Campaigns
        </button>
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Campaign Analytics</h1>
            <p className="text-slate-500 mt-1 font-medium italic">Broadcast Performance & ROI Deep-dive</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-xl font-bold uppercase tracking-wider text-xs border-slate-200">
                <Filter className="mr-2 h-4 w-4" /> Filter Date
             </Button>
             <Button variant="outline" className="rounded-xl font-bold uppercase tracking-wider text-xs border-slate-200">
                <Download className="mr-2 h-4 w-4" /> Export Report
             </Button>
          </div>
        </div>
      </div>

      {/* Main ROI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
            title="Total Revenue" 
            value={`₹${metrics?.totalRevenue.toLocaleString()}`} 
            icon={<DollarSign className="text-emerald-500" />}
            trend="+12% vs last month"
            positive={true}
        />
        <MetricCard 
            title="Total Spend" 
            value={`₹${metrics?.totalCost.toLocaleString()}`} 
            icon={<Zap className="text-amber-500" />}
            trend="Budget utilized"
            positive={null}
        />
        <MetricCard 
            title="ROI Percentage" 
            value={`${metrics?.roi}%`} 
            icon={<TrendingUp className="text-blue-500" />}
            trend={metrics?.roi && metrics.roi > 0 ? "Profitable" : "Breakeven"}
            positive={metrics?.roi && metrics.roi > 0}
        />
        <MetricCard 
            title="Cost per Conversion" 
            value={`₹${metrics?.costPerConversion}`} 
            icon={<Target className="text-rose-500" />}
            trend="Acquisition cost"
            positive={null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Funnel Chart */}
        <Card className="rounded-3xl shadow-xl shadow-slate-100/50 border-slate-100 overflow-hidden lg:col-span-1">
            <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                <CardTitle className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    Delivery Funnel
                </CardTitle>
                <CardDescription>Conversion flow from sent to converted</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 flex flex-col items-center">
                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={funnelData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                className="text-[10px] font-black uppercase text-slate-400"
                                width={80}
                            />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar 
                                dataKey="value" 
                                fill="#3b82f6" 
                                radius={[0, 10, 10, 0]}
                                barSize={40}
                            >
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="w-full space-y-4 mt-6">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Delivery Rate</span>
                        <span className="text-sm font-bold text-slate-900">{metrics?.deliveryRate}%</span>
                    </div>
                    <Progress value={metrics?.deliveryRate} className="h-2 bg-slate-100" />
                    
                    <div className="flex justify-between items-center px-2 pt-2">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Read Rate</span>
                        <span className="text-sm font-bold text-slate-900">{metrics?.readRate}%</span>
                    </div>
                    <Progress value={metrics?.readRate} className="h-2 bg-slate-100" />

                    <div className="flex justify-between items-center px-2 pt-2">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Conversion Rate</span>
                        <span className="text-sm font-bold text-slate-900">{metrics?.conversionRate}%</span>
                    </div>
                    <Progress value={metrics?.conversionRate} className="h-2 bg-slate-100" />
                </div>
            </CardContent>
        </Card>

        {/* Engagement Trends */}
        <Card className="rounded-3xl shadow-xl shadow-slate-100/50 border-slate-100 overflow-hidden lg:col-span-2">
            <CardHeader className="bg-slate-50/50 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-purple-600" />
                        Engagement Trends
                    </CardTitle>
                    <CardDescription>Activity breakdown over the last 24 hours</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="rounded-lg bg-blue-50 text-blue-600 border-blue-100 px-3 py-1">Sent</Badge>
                    <Badge variant="outline" className="rounded-lg bg-purple-50 text-purple-600 border-purple-100 px-3 py-1">Read</Badge>
                    <Badge variant="outline" className="rounded-lg bg-emerald-50 text-emerald-600 border-emerald-100 px-3 py-1">Conversions</Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-8">
                <div className="w-full h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={timelineData}>
                            <defs>
                                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="time" 
                                axisLine={false} 
                                tickLine={false}
                                className="text-[10px] font-bold text-slate-400"
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false}
                                className="text-[10px] font-bold text-slate-400"
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" dataKey="sent" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSent)" strokeWidth={3} />
                            <Bar dataKey="read" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={12} />
                            <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* A/B Test Comparison & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* A/B Test Comparison */}
           {abTestData.length > 1 && (
               <Card className="rounded-3xl shadow-xl shadow-slate-100/50 border-slate-100 overflow-hidden">
                   <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                       <CardTitle className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                           <Zap className="h-5 w-5 text-amber-500" />
                           Multi-Variant Performance
                       </CardTitle>
                       <CardDescription>Comparative analysis of all message variations</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-8">
                       <div className="w-full h-[300px]">
                           <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={abTestData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                   <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] font-black uppercase" />
                                   <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold" />
                                   <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                   <Legend />
                                   <Bar dataKey="deliveryRate" name="Delivered %" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                   <Bar dataKey="readRate" name="Read %" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                               </BarChart>
                           </ResponsiveContainer>
                       </div>
                   </CardContent>
               </Card>
           )}

           {/* Activity Heatmap */}
           <Card className="rounded-3xl shadow-xl shadow-slate-100/50 border-slate-100 overflow-hidden">
               <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                   <CardTitle className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                       <TrendingUp className="h-5 w-5 text-emerald-600" />
                       Engagement Heatmap
                   </CardTitle>
                   <CardDescription>Audience activity by day and hour</CardDescription>
               </CardHeader>
               <CardContent className="pt-8">
                    {/* Tag Filters */}
                    <div className="mb-6 flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Apply Segment:</span>
                        {['VIP', 'NewLead', 'Qualified', 'Won'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTags(prev => 
                                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                )}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                                    selectedTags.includes(tag) 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                                    : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                        {selectedTags.length > 0 && (
                            <button 
                                onClick={() => setSelectedTags([])}
                                className="text-[8px] font-bold text-slate-400 uppercase hover:text-red-500 underline underline-offset-4"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-25 gap-1">
                        {/* Header: Hours */}
                        <div className="col-span-1"></div>
                        {Array.from({length: 24}).map((_, i) => (
                            <div key={i} className="text-[8px] text-slate-400 font-bold text-center">
                                {i % 4 === 0 ? `${i}h` : ''}
                            </div>
                        ))}

                        {/* Rows: Days */}
                        {DAYS.map((day, d) => (
                            <React.Fragment key={day}>
                                <div className="text-[10px] font-black text-slate-400 uppercase pr-2 text-right self-center">{day}</div>
                                {Array.from({length: 24}).map((_, h) => {
                                    const val = heatmapData.find(m => m.day === d && m.hour === h)?.value || 0;
                                    const opacity = val > 0 ? Math.min(0.2 + (val / 10), 1) : 0.05;
                                    return (
                                        <div 
                                            key={h} 
                                            title={`${day} ${h}:00 - ${val} reads`}
                                            className="aspect-square rounded-sm transition-all hover:scale-125 cursor-help"
                                            style={{ 
                                                backgroundColor: val > 0 ? `rgba(59, 130, 246, ${opacity})` : '#f1f5f9'
                                            }}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intensity:</span>
                        <div className="flex gap-1 items-center">
                            <span className="text-[8px] text-slate-400">Low</span>
                            <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-600" />
                            <span className="text-[8px] text-slate-400">High</span>
                        </div>
                    </div>
               </CardContent>
           </Card>
      </div>

      {/* Comparison Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-100/50">
               <CardContent className="p-8 flex items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                         <Percent size={32} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Conversion Efficiency</h4>
                        <p className="text-2xl font-black text-slate-900">High Engagement</p>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed italic mt-1">
                            Your conversion rate is {(metrics?.conversionRate || 0) > 20 ? 'stellar' : 'within average bounds'} compared to industry standards.
                        </p>
                    </div>
               </CardContent>
           </Card>
           
           <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-100/50 bg-slate-900 text-white">
               <CardContent className="p-8 flex items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0 border border-white/5">
                         <TrendingUp size={32} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">ROI Outlook</h4>
                        <p className="text-2xl font-black text-white">Positive Projection</p>
                        <p className="text-sm text-slate-300 font-medium leading-relaxed italic mt-1">
                            Based on your ₹{metrics?.totalCost} spend, you've generated ₹{metrics?.totalRevenue} in revenue.
                        </p>
                    </div>
               </CardContent>
           </Card>
      </div>
    </div>
  );
}

// --- Sub-components ---

function MetricCard({ title, value, icon, trend, positive }: any) {
    return (
        <Card className="rounded-3xl shadow-xl shadow-slate-100/50 border-slate-100 hover:scale-[1.03] transition-all duration-300 group">
            <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                     <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        {icon}
                     </div>
                     <Badge variant="outline" className={cn(
                        "rounded-lg px-2.5 py-1 border-none font-bold text-[10px] tracking-tight uppercase",
                        positive === true ? "bg-emerald-50 text-emerald-600" : 
                        positive === false ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
                     )}>
                        {trend}
                     </Badge>
                </div>
                <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h4>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
