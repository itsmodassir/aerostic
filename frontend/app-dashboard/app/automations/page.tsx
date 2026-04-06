'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Link as LinkIcon, 
  Copy, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ExternalLink,
  Settings,
  Code,
  Clock
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Trigger {
  id: string;
  name: string;
  apiKey: string;
  campaign: { name: string; id: string };
  triggerType: string;
  isActive: boolean;
  createdAt: string;
}

export default function AutomationsPage() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const fetchTriggers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/campaigns/triggers');
      setTriggers(res.data);
    } catch (err) {
      toast.error('Failed to load triggers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
      try {
        const res = await api.get('/campaigns');
        setCampaigns(res.data);
      } catch {
        toast.error('Failed to load campaigns');
      }
  };

  useEffect(() => {
    fetchTriggers();
    fetchCampaigns();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Webhook URL copied to clipboard!');
  };

  const buildTriggerUrl = (apiKey: string) => {
    if (typeof window === 'undefined') return `/api/v1/campaigns/triggers/${apiKey}`;
    return `${window.location.origin}/api/v1/campaigns/triggers/${apiKey}`;
  };

  const disableTrigger = async (id: string) => {
    try {
      await api.delete(`/campaigns/triggers/${id}`);
      toast.success('Trigger disabled');
      fetchTriggers();
    } catch {
      toast.error('Could not disable trigger');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">External Automations</h1>
          <p className="text-gray-500 mt-1">Connect Shopify, CRMs, or your custom app via Webhooks.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="rounded-xl h-12 bg-blue-600">
          <Plus className="mr-2 h-5 w-5" />
          Create Trigger
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {!loading && triggers.length === 0 ? (
           <Card className="border-dashed border-2 py-20 bg-gray-50/30">
                <CardContent className="flex flex-col items-center justify-center">
                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                        <LinkIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="font-bold text-gray-900">No active triggers</p>
                    <p className="text-sm text-gray-500 text-center max-w-xs mt-1">
                        Connect external events to Aerostic campaigns using our API gateway.
                    </p>
                </CardContent>
           </Card>
        ) : (
            triggers.map(trigger => (
                <Card key={trigger.id} className="rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border-gray-100">
                    <div className="flex flex-col md:flex-row h-full">
                        <div className="flex-1 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-xl">
                                    <Zap className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{trigger.name}</h3>
                                    <p className="text-xs text-gray-500">Connected to <span className="text-blue-600 font-semibold">{trigger.campaign.name}</span></p>
                                </div>
                                <Badge className="ml-auto bg-green-50 text-green-600 border-green-100">Active</Badge>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Webhook Endpoint</p>
                                        <button 
                                            onClick={() => copyToClipboard(buildTriggerUrl(trigger.apiKey))}
                                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            <Copy className="h-3 w-3" /> Copy URL
                                        </button>
                                    </div>
                                    <code className="text-xs text-slate-600 block break-all font-mono">
                                        {buildTriggerUrl(trigger.apiKey)}
                                    </code>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="h-3.5 w-3.5" />
                                        Created {format(new Date(trigger.createdAt), 'MMM dd, yyyy')}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                        12.4k executions
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50/50 border-l border-gray-100 p-6 w-full md:w-64 flex flex-col gap-3 justify-center">
                            <Button variant="outline" className="w-full bg-white rounded-xl text-xs font-bold gap-2">
                                <Settings className="h-4 w-4" /> Edit Mapping
                            </Button>
                            <Button variant="outline" className="w-full bg-white rounded-xl text-xs font-bold gap-2">
                                <Code className="h-4 w-4" /> View Usage
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => disableTrigger(trigger.id)}
                                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold gap-2"
                            >
                                <Trash2 className="h-4 w-4" /> Disable
                            </Button>
                        </div>
                    </div>
                </Card>
            ))
        )}

        {/* Documentation Sidebar Hint */}
        <Card className="bg-indigo-600 text-white rounded-3xl p-8 border-none relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">Automate with JSON payloads</h2>
                <p className="text-indigo-100 max-w-xl mb-6">
                    Our triggers support dynamic variable mapping. Send attributes like <code className="bg-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono">order_id</code> or <code className="bg-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono">first_name</code> in your webhook body to personalize messages in real-time.
                </p>
                <Button variant="secondary" className="rounded-xl font-bold bg-white text-indigo-600 hover:bg-indigo-50">
                    Read Documentation <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                <Code className="w-64 h-64" />
            </div>
        </Card>
      </div>

      {showCreateModal && (
          <CreateTriggerModal 
            campaigns={campaigns} 
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
                setShowCreateModal(false);
                fetchTriggers();
            }}
          />
      )}
    </div>
  );
}

function CreateTriggerModal({ campaigns, onClose, onSuccess }: { campaigns: any[], onClose: () => void, onSuccess: () => void }) {
    const [name, setName] = useState('');
    const [campaignId, setCampaignId] = useState('');
    
    const handleSave = async () => {
        try {
            await api.post('/campaigns/triggers', {
                name,
                campaignId,
                triggerType: 'webhook'
            });
            toast.success('Trigger created!');
            onSuccess();
        } catch (err) {
            toast.error('Could not create trigger');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl">
                <CardHeader>
                    <CardTitle>New API Trigger</CardTitle>
                    <CardDescription>Configure an external endpoint for your campaign.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Trigger Name</label>
                        <Input placeholder="e.g., Shopify New Lead" value={name} onChange={e => setName(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Target Campaign</label>
                        <select 
                            className="w-full h-10 px-4 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none"
                            value={campaignId}
                            onChange={e => setCampaignId(e.target.value)}
                        >
                            <option value="">Select a Campaign</option>
                            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
                        <Button disabled={!name || !campaignId} onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">Create Trigger</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function format(date: Date, str: string) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
