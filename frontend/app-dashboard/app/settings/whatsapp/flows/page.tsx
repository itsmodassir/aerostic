'use client';
import Link from 'next/link';
import { Loader2, Plus, RefreshCw, Trash2, Workflow, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, lazy, Suspense } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

const WaFlowBuilder = lazy(() => import('@/components/whatsapp/wa-flow-builder/WaFlowBuilder'));

export default function WhatsAppFlowsPage() {
  const searchParams = useSearchParams();
  const [flows, setFlows] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFlow, setNewFlow] = useState({ name: '', category: 'OTHER' });

  // Builder state
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderFlow, setBuilderFlow] = useState<{ id: string; name: string; data?: any } | null>(null);

  const loadFlows = async () => {
    setLoading(true);
    try {
      const statusRes = await api.get('/whatsapp/status');
      const isConnected = !!statusRes.data?.connected;
      setConnected(isConnected);

      if (!isConnected) {
        setFlows([]);
        return;
      }

      const flowRes = await api.get('/whatsapp/flows');
      setFlows(Array.isArray(flowRes.data) ? flowRes.data : []);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to load WhatsApp flows';
      toast.error(message);
      setFlows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFlows();
  }, []);

  useEffect(() => {
    const connectedFlag = searchParams.get('connected');
    if (connectedFlag === '1') {
      void loadFlows();
    }
  }, [searchParams]);

  const handleCreateFlow = async () => {
    if (!newFlow.name.trim()) return;

    setCreating(true);
    try {
      const res = await api.post('/whatsapp/flows', {
        name: newFlow.name,
        categories: [newFlow.category],
      });
      toast.success('Flow created successfully');
      setShowCreateModal(false);
      setNewFlow({ name: '', category: 'OTHER' });
      
      if (res.data?.id) {
        setBuilderFlow({ id: res.data.id, name: newFlow.name });
        setBuilderOpen(true);
      }
      await loadFlows();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create flow');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenBuilder = async (flow: any) => {
    // Try to load existing canvas data if it exists
    let canvasData = undefined;
    try {
      const res = await api.get(`/whatsapp/flows/${flow.id}/canvas`);
      canvasData = res.data;
    } catch {
      // No canvas data yet, builder will start fresh
    }
    setBuilderFlow({ id: flow.id, name: flow.name, data: canvasData });
    setBuilderOpen(true);
  };

  const handleTogglePublish = async (flow: any) => {
    const action = flow.status === 'PUBLISHED' ? 'unpublish' : 'publish';
    setBusyId(`${action}:${flow.id}`);
    try {
      await api.post(`/whatsapp/flows/${flow.id}/${action}`);
      toast.success(action === 'publish' ? 'Flow published' : 'Flow unpublished');
      await loadFlows();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${action} flow`);
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteFlow = async (flow: any) => {
    if (!window.confirm(`Delete flow "${flow.name}"?`)) {
      return;
    }

    setBusyId(`delete:${flow.id}`);
    try {
      await api.delete(`/whatsapp/flows/${flow.id}`);
      toast.success('Flow deleted');
      await loadFlows();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete flow');
    } finally {
      setBusyId(null);
    }
  };

  const statusTone = (status?: string) => {
    switch ((status || '').toUpperCase()) {
      case 'PUBLISHED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'DRAFT':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'DEPRECATED':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <>
      {/* Flow Builder Overlay */}
      {builderOpen && builderFlow && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          </div>
        }>
          <WaFlowBuilder
            flowId={builderFlow.id}
            flowName={builderFlow.name}
            initialData={builderFlow.data}
            onClose={() => setBuilderOpen(false)}
            onSaved={() => {
              toast.success('Flow saved successfully!');
              setBuilderOpen(false);
              loadFlows();
            }}
          />
        </Suspense>
      )}

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <Workflow className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                WhatsApp Builder
              </p>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Create, publish, and visually design interactive customer journeys.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => void loadFlows()} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="rounded-xl shadow-sm" onClick={() => setShowCreateModal(true)} disabled={!connected || creating}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              New Flow
            </Button>
          </div>
        </div>

        {!connected && !loading ? (
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
              <Workflow className="h-16 w-16 text-gray-200" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900">Connect WhatsApp before creating flows</p>
                <p className="text-sm text-gray-500">The Meta Cloud account needs to be connected before the flow builder can load or publish assets.</p>
              </div>
              <Button asChild className="rounded-xl">
                <Link href="/settings/whatsapp">Open WhatsApp Settings</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6">
            {loading ? <div className="h-48 flex items-center justify-center text-gray-400">Loading flows...</div>
            : !connected ? null
            : flows.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center gap-3 text-gray-400">
                <Workflow className="h-16 w-16 text-gray-200" />
                <p>No flows created yet.</p>
                <Button variant="outline" className="rounded-xl" onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create first flow
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flows.map((f: any) => (
                  <div key={f.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-gray-900">{f.name}</h3>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusTone(f.status)}`}>
                          {f.status || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-gray-400">{f.id}</p>
                      <p className="text-xs text-gray-400">Updated {f.updated_at ? new Date(f.updated_at).toLocaleString() : 'recently'}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* Edit / Open Builder */}
                      <Button
                        variant="default"
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex-1"
                        onClick={() => void handleOpenBuilder(f)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Builder
                      </Button>

                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => void handleTogglePublish(f)}
                        disabled={busyId === `publish:${f.id}` || busyId === `unpublish:${f.id}`}
                      >
                        {(busyId === `publish:${f.id}` || busyId === `unpublish:${f.id}`) ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {f.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </Button>

                      <Button
                        variant="outline"
                        className="rounded-xl text-red-600 hover:text-red-700"
                        onClick={() => void handleDeleteFlow(f)}
                        disabled={busyId === `delete:${f.id}`}
                      >
                        {busyId === `delete:${f.id}` ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Create Flow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl scale-in-center">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                        <Plus size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">New WhatsApp Flow</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5">Meta Asset Creation</p>
                    </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors border border-gray-200 text-gray-400">
                    <X className="rotate-45" size={20} />
                </button>
            </div>
            
            <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Flow Identity</label>
                        <input 
                            placeholder="e.g. customer_onboarding_v1"
                            className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none font-bold text-slate-800 transition-all"
                            value={newFlow.name}
                            onChange={(e) => setNewFlow({...newFlow, name: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Category (Required by Meta)</label>
                        <select 
                            className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 focus:border-blue-500 bg-white font-bold text-slate-800 outline-none appearance-none cursor-pointer"
                            value={newFlow.category}
                            onChange={(e) => setNewFlow({...newFlow, category: e.target.value})}
                        >
                            <option value="OTHER">Other / General</option>
                            <option value="APPOINTMENT_BOOKING">Appointment Booking</option>
                            <option value="CUSTOMER_SUPPORT">Customer Support</option>
                            <option value="CONTACT_US">Contact Us</option>
                            <option value="LEAD_GENERATION">Lead Generation</option>
                            <option value="SURVEY">Customer Survey</option>
                            <option value="SIGN_UP">User Sign Up</option>
                            <option value="SIGN_IN">User Sign In</option>
                        </select>
                    </div>
                </div>

                <Button 
                    className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 disabled:opacity-50"
                    disabled={!newFlow.name.trim() || creating}
                    onClick={handleCreateFlow}
                >
                    {creating ? <Loader2 className="animate-spin mr-3" size={20} /> : <Plus className="mr-3" size={20} />}
                    Initialize Meta Flow Asset
                </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
