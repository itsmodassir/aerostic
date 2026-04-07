'use client';

import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Search, Plus, Globe, Code, Star, Tag, Zap, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Template {
  id: string; name: string; language: string;
  category: string; status: string; components: any[];
}

const statusColor: Record<string, string> = {
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState<{
    name: string;
    category: string;
    language: string;
    components: any[];
  }>({
    name: '',
    category: 'MARKETING',
    language: 'en_US',
    components: [{ type: 'BODY', text: '' }]
  });
  const [creating, setCreating] = useState(false);
  const [flows, setFlows] = useState<any[]>([]);
  const [useFlow, setUseFlow] = useState(false);
  const [selectedFlowId, setSelectedFlowId] = useState('');
  const [buttonText, setButtonText] = useState('Open Flow');

  const fetch = async () => {
    try { setLoading(true); const r = await api.get('/templates'); setTemplates(r.data || []); }
    catch { toast.error('Failed to load templates'); } finally { setLoading(false); }
  };

  const sync = async () => {
    try { setSyncing(true); await api.post('/templates/sync'); await fetch(); toast.success('Templates synced from Meta'); }
    catch { toast.error('Sync failed'); } finally { setSyncing(false); }
  };

  const fetchFlows = async () => {
    try { const r = await api.get('/whatsapp/flows'); setFlows(r.data || []); }
    catch { console.error('Failed to load flows'); }
  };

  useEffect(() => { 
    fetch(); 
    fetchFlows();
  }, []);

  const filtered = templates.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><FileText className="h-8 w-8 text-purple-500" />WhatsApp Templates</h1>
          <p className="text-gray-500 mt-1">Manage your Meta-approved message templates.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl" onClick={sync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />{syncing ? 'Syncing...' : 'Sync from Meta'}
          </Button>
          <Button className="rounded-xl" onClick={() => setShowCreateModal(true)}><Plus className="h-4 w-4 mr-2" />New Template</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Total', value: templates.length, color: 'bg-blue-50 text-blue-600' },
          { label: 'Approved', value: templates.filter(t => t.status === 'APPROVED').length, color: 'bg-green-50 text-green-600' },
          { label: 'Pending', value: templates.filter(t => t.status === 'PENDING').length, color: 'bg-yellow-50 text-yellow-600' },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="p-6"><p className="text-sm text-gray-500">{s.label}</p><p className="text-3xl font-bold mt-1">{s.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex justify-between items-center">
            <CardTitle>All Templates</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search templates..." className="pl-10 w-64 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">Loading templates...</div>
          ) : filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-3">
              <FileText className="h-12 w-12 text-gray-200" />
              <p>{search ? 'No matching templates.' : 'No templates yet. Sync from Meta to import your approved templates.'}</p>
            </div>
          ) : (
            <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(t => (
                <div key={t.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 truncate">{t.name}</h3>
                    <Badge variant="outline" className={`rounded-full text-xs shrink-0 ml-2 ${statusColor[t.status] || 'bg-gray-50 text-gray-600'}`}>{t.status}</Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-500"><Globe className="h-3 w-3" />{t.language}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500"><Tag className="h-3 w-3" />{t.category}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500"><Code className="h-3 w-3" />{t.components?.length || 0} components</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="px-8 pt-8 border-b border-gray-50 pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold">Create Template</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)} className="rounded-full"><Plus className="rotate-45" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Template Name</label>
                  <Input 
                    placeholder="e.g. summer_sale_announce" 
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white font-medium text-sm outline-none"
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                    >
                      <option value="MARKETING">Marketing</option>
                      <option value="UTILITY">Utility</option>
                      <option value="AUTHENTICATION">Authentication</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Language</label>
                    <select 
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white font-medium text-sm outline-none"
                      value={newTemplate.language}
                      onChange={(e) => setNewTemplate({...newTemplate, language: e.target.value})}
                    >
                      <option value="en_US">English (US)</option>
                      <option value="hi_IN">Hindi</option>
                      <option value="pt_BR">Portuguese (BR)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Message Body</label>
                  <textarea 
                    placeholder="Hello {{1}}, welcome to our store!"
                    className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm resize-none"
                    value={newTemplate.components[0].text}
                    onChange={(e) => {
                      const comps = [...newTemplate.components];
                      comps[0].text = e.target.value;
                      setNewTemplate({...newTemplate, components: comps});
                    }}
                  />
                  <p className="text-[10px] text-gray-400 font-medium">Use {"{{1}}"}, {"{{2}}"} etc. for dynamic variables.</p>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className={`h-4 w-4 ${useFlow ? 'text-amber-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-semibold text-gray-700">Add Flow Button</span>
                  </div>
                  <button 
                    onClick={() => setUseFlow(!useFlow)}
                    className={`w-10 h-5 rounded-full transition-all relative ${useFlow ? 'bg-amber-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${useFlow ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                {useFlow && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Select Flow</label>
                      <select 
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white font-medium text-sm outline-none"
                        value={selectedFlowId}
                        onChange={(e) => setSelectedFlowId(e.target.value)}
                      >
                        <option value="">Choose a flow...</option>
                        {flows.map(f => (
                          <option key={f.id} value={f.id}>{f.name} ({f.status})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Button Text</label>
                      <Input 
                        placeholder="e.g. Open Survey" 
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value.slice(0, 25))}
                        className="h-11 rounded-xl"
                      />
                      <p className="text-[10px] text-gray-400">Max 25 characters.</p>
                    </div>
                  </div>
                )}
              </div>
              <Button 
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100"
                disabled={!newTemplate.name || !newTemplate.components[0].text || creating}
                onClick={async () => {
                  try {
                    setCreating(true);
                    
                    const templateData = { ...newTemplate };
                    if (useFlow && selectedFlowId) {
                      templateData.components.push({
                        type: 'BUTTONS',
                        buttons: [
                          {
                            type: 'FLOW',
                            text: buttonText,
                            flow_id: selectedFlowId,
                            flow_action: 'navigate',
                            navigate_screen: 'WELCOME_SCREEN'
                          }
                        ]
                      });
                    }

                    await api.post('/templates', templateData);
                    toast.success('Template submitted for approval');
                    setShowCreateModal(false);
                    fetch();
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || 'Failed to create template');
                  } finally {
                    setCreating(false);
                  }
                }}
              >
                {creating ? <RefreshCw className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                Submit to Meta
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
