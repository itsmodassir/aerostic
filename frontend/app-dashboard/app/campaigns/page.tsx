'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  BarChart3, 
  Repeat, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  Filter,
  MoreVertical,
  RefreshCw,
  Zap,
  Clock,
  Sparkles,
  Trash2
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from "@/components/ui/Progress";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// --- Types ---
type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  templateName: string;
  scheduledAt: string | null;
  nextRunAt: string | null;
  isRecurring: boolean;
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  deliveredCount: number;
  readCount: number;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components: any[];
}

// --- Main Page Component ---
export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    completed: 0,
    failed: 0
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/campaigns');
      const data = res.data;
      setCampaigns(data);
      
      const s = {
        total: data.length,
        active: data.filter((c: any) => c.status === 'sending').length,
        scheduled: data.filter((c: any) => c.status === 'scheduled').length,
        completed: data.filter((c: any) => c.status === 'completed').length,
        failed: data.filter((c: any) => c.status === 'failed').length
      };
      setStats(s);
    } catch (err) {
      toast.error('Failed to load campaigns');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Manager</h1>
          <p className="text-gray-500 mt-1">Design, schedule, and track your WhatsApp broadcasts.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="rounded-xl h-12 px-6">
          <Plus className="mr-2 h-5 w-5" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Sende" value={stats.active} icon={<RefreshCw className="text-blue-500" />} />
        <StatCard title="Scheduled" value={stats.scheduled} icon={<Calendar className="text-purple-500" />} />
        <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 className="text-green-500" />} />
        <StatCard title="Failed" value={stats.failed} icon={<XCircle className="text-red-500" />} />
      </div>

      <Card className="rounded-2xl shadow-sm border-gray-100 overflow-hidden">
        <CardHeader className="border-b border-gray-50 bg-gray-50/50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Campaign History</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search campaigns..." className="pl-10 w-64 bg-white" />
              </div>
              <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="pl-6 w-[250px]">Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Recurrence</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-64 text-center text-gray-400">Loading your campaigns...</TableCell></TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-64 text-center text-gray-400">No campaigns found. Start by creating one!</TableCell></TableRow>
              ) : campaigns.map((campaign) => (
                <TableRow key={campaign.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="pl-6 py-4 font-medium">
                    <div className="flex flex-col">
                      <span>{campaign.name}</span>
                      <span className="text-xs text-gray-400 font-normal">{campaign.templateName}</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={campaign.status} /></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 w-40">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{campaign.sentCount} / {campaign.totalContacts}</span>
                        <span>{campaign.totalContacts > 0 ? Math.round((campaign.sentCount / campaign.totalContacts) * 100) : 0}%</span>
                      </div>
                      <Progress value={campaign.totalContacts > 0 ? (campaign.sentCount / campaign.totalContacts) * 100 : 0} className="h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {campaign.scheduledAt ? format(new Date(campaign.scheduledAt), 'MMM dd, HH:mm') : 'Instant'}
                  </TableCell>
                  <TableCell>
                    {campaign.isRecurring ? (
                      <div className="flex items-center gap-1.5 text-blue-600 text-sm font-medium">
                        <Repeat className="h-3.5 w-3.5" />
                        Next: {campaign.nextRunAt ? format(new Date(campaign.nextRunAt), 'MMM dd') : 'Soon'}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">One-time</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6 shrink-0 flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-lg font-bold text-[10px] uppercase tracking-widest text-blue-600 hover:bg-blue-50"
                      onClick={() => router.push(`/campaigns/${campaign.id}/analytics`)}
                    >
                      <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                      Results
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showCreateModal && (
        <CreateCampaignWizard 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCampaigns();
          }} 
        />
      )}
    </div>
  );
}

// --- Sub-Components ---

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <Card className="rounded-2xl shadow-sm border-gray-100 hover:scale-[1.02] transition-transform cursor-default">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="p-2.5 bg-gray-50 rounded-xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  const styles: Record<CampaignStatus, string> = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    scheduled: 'bg-purple-100 text-purple-600 border-purple-200',
    sending: 'bg-blue-100 text-blue-600 border-blue-200 animate-pulse',
    completed: 'bg-green-100 text-green-600 border-green-200',
    failed: 'bg-red-100 text-red-600 border-red-200'
  };

  return (
    <Badge variant="outline" className={`rounded-full px-3 py-0.5 font-medium border ${styles[status]}`}>
      {status.toUpperCase()}
    </Badge>
  );
}

function CreateCampaignWizard({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    recipientType: 'ALL',
    isRecurring: false,
    recurrenceRule: '',
    scheduledAt: '',
    segmentationConfig: { tags: [] as string[] },
    isABTest: false,
    variants: [{ templateName: '', templateLanguage: 'en_US', weight: 1, variables: {} as Record<string, string> }],
  });

  const [aiTime, setAiTime] = useState<{day: number, hour: number, message: string} | null>(null);

  const fetchOptimalTime = async () => {
    try {
      const res = await api.get(`/campaigns/optimal-time`);
      setAiTime(res.data);
    } catch (err) {
      console.error('Failed to fetch AI time');
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const res = await api.get('/templates');
      setTemplates(res.data);
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (step === 2) fetchTemplates();
  }, [step]);

  const handleSubmit = async () => {
    try {
      await api.post('/campaigns', formData);
      toast.success('Campaign created successfully');
      onSuccess();
    } catch (err) {
      toast.error('Failed to create campaign');
    }
  };

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="h-2 bg-gray-100">
          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
        
        <CardHeader className="px-8 pt-8 border-b border-gray-50 pb-6">
          <div className="flex justify-between items-center mb-1">
            <CardTitle className="text-2xl font-bold">New Campaign</CardTitle>
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Step {step} of 4</span>
          </div>
          <CardDescription>
            {step === 1 && "Name your campaign broadcast."}
            {step === 2 && "Configure variations and templates."}
            {step === 3 && "Select target audience segment."}
            {step === 4 && "Finalize and schedule broadcast."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700">Campaign Name</label>
              <Input 
                placeholder="e.g., Summer Lead Follow-up" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="h-12 rounded-xl border-gray-200 focus:ring-blue-500"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
                  <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-amber-500" />
                      <div>
                          <p className="text-sm font-bold text-amber-900 uppercase tracking-tight">Multi-Variant Testing</p>
                          <p className="text-xs text-amber-600">Test up to 4 variations side-by-side.</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => setFormData({...formData, isABTest: !formData.isABTest})}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.isABTest ? 'bg-amber-500' : 'bg-slate-200'}`}
                  >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isABTest ? 'right-1' : 'left-1'}`} />
                  </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Variations</p>
                    {formData.isABTest && formData.variants.length < 4 && (
                        <Button 
                            variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-blue-600 hover:bg-blue-50"
                            onClick={() => setFormData({...formData, variants: [...formData.variants, { templateName: '', templateLanguage: 'en_US', weight: 1, variables: {} }]})}
                        >
                            <Plus className="h-3 w-3 mr-1" /> Add Variation
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    {formData.variants.map((v, i) => (
                        <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg">Variant {String.fromCharCode(65 + i)}</span>
                                {i > 0 && (
                                    <button onClick={() => setFormData({...formData, variants: formData.variants.filter((_, idx) => idx !== i)})} className="text-slate-400 hover:text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select 
                                    className="w-full h-10 px-4 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none"
                                    value={v.templateName}
                                    onChange={(e) => {
                                        const newVariants = [...formData.variants];
                                        newVariants[i].templateName = e.target.value;
                                        const t = templates.find(temp => temp.name === e.target.value);
                                        if (t) newVariants[i].templateLanguage = t.language;
                                        setFormData({...formData, variants: newVariants});
                                    }}
                                >
                                    <option value="">Select Template</option>
                                    {templates.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                </select>
                                <select 
                                    className="w-full h-10 px-4 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none"
                                    value={v.templateLanguage}
                                    onChange={(e) => {
                                        const newVariants = [...formData.variants];
                                        newVariants[i].templateLanguage = e.target.value;
                                        setFormData({...formData, variants: newVariants});
                                    }}
                                >
                                    <option value="en_US">English (US)</option>
                                    <option value="hi_IN">Hindi</option>
                                    <option value="es_ES">Spanish</option>
                                    <option value="pt_BR">Portuguese (BR)</option>
                                </select>
                            </div>

                            {/* Variable Inputs */}
                            {(() => {
                                const t = templates.find(temp => temp.name === v.templateName);
                                if (!t) return null;
                                const body = t.components?.find((c: any) => c.type === 'BODY')?.text || '';
                                const variables = body.match(/{{(\d+)}}/g) || [];
                                if (variables.length === 0) return null;

                                return (
                                    <div className="mt-4 space-y-3 pt-4 border-t border-slate-50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Template Variables</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {variables.map((varTag: string) => {
                                                const varNum = varTag.match(/\d+/)![0];
                                                return (
                                                    <div key={varNum} className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 ml-1">Variable {varTag}</label>
                                                        <Input 
                                                            placeholder={`Value for ${varTag}`}
                                                            value={v.variables?.[varNum] || ''}
                                                            onChange={(e) => {
                                                                const newVariants = [...formData.variants];
                                                                newVariants[i].variables = { 
                                                                    ...(newVariants[i].variables || {}), 
                                                                    [varNum]: e.target.value 
                                                                };
                                                                setFormData({...formData, variants: newVariants});
                                                            }}
                                                            className="h-9 rounded-lg text-xs"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    ))}
                </div>

                {formData.isABTest && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Audience Split</p>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                                {Math.round(100 / formData.variants.length)}% Each
                            </span>
                        </div>
                        <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                             {formData.variants.map((_, i) => (
                                 <div key={i} style={{ width: `${100 / formData.variants.length}%` }} className={`h-full ${['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'][i]}`} />
                             ))}
                        </div>
                    </div>
                )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData({...formData, recipientType: 'ALL'})}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.recipientType === 'ALL' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <Users className={`h-8 w-8 mb-3 ${formData.recipientType === 'ALL' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className="font-bold">All Contacts</p>
                </div>
                <div 
                  onClick={() => setFormData({...formData, recipientType: 'SEGMENT'})}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.recipientType === 'SEGMENT' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <Filter className={`h-8 w-8 mb-3 ${formData.recipientType === 'SEGMENT' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className="font-bold">Segmented</p>
                </div>
              </div>
              {formData.recipientType === 'SEGMENT' && (
                <Input placeholder="Tags (VIP, Lead...)" onChange={(e) => setFormData({...formData, segmentationConfig: { tags: e.target.value.split(',').map(t => t.trim()) }})} className="bg-gray-50" />
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div onClick={() => setFormData({...formData, isRecurring: false})} className={`p-6 rounded-2xl border-2 cursor-pointer ${!formData.isRecurring ? 'border-blue-500' : 'border-gray-100'}`}><Clock className="mb-2" /> One-time</div>
                <div onClick={() => setFormData({...formData, isRecurring: true})} className={`p-6 rounded-2xl border-2 cursor-pointer ${formData.isRecurring ? 'border-blue-500' : 'border-gray-100'}`}><Repeat className="mb-2" /> Recurring</div>
              </div>
              {!formData.isRecurring ? (
                <Input type="datetime-local" value={formData.scheduledAt} onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})} />
              ) : (
                <div className="space-y-4">
                  <select className="w-full h-12 rounded-xl border border-gray-200 px-4" onChange={(e) => setFormData({...formData, recurrenceRule: e.target.value})}>
                    <option value="">Select frequency...</option>
                    <option value="0 9 * * *">Daily at 9:00 AM</option>
                  </select>
                  <div className="p-4 bg-blue-50 rounded-2xl">
                    <Button variant="ghost" onClick={fetchOptimalTime} className="text-blue-600 text-xs"><Sparkles className="mr-2" /> AI Optimal Time</Button>
                    {aiTime && <p className="text-xs font-bold mt-2 text-blue-900">{aiTime.message}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <div className="p-8 border-t border-gray-50 flex justify-between bg-gray-50/30">
          <Button variant="ghost" onClick={step === 1 ? onClose : back} className="rounded-xl">
            <ChevronLeft className="mr-2 h-4 w-4" /> {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step < 4 ? (
            <Button onClick={next} disabled={step === 1 && !formData.name} className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl">Continue <ChevronRight className="ml-2 h-4 w-4" /></Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl">Launch <BarChart3 className="ml-2 h-4 w-4" /></Button>
          )}
        </div>
      </Card>
    </div>
  );
}
