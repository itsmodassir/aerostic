'use client';

import { useEffect, useState } from 'react';
import { Bot, BrainCircuit, CheckCircle2, Loader2, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';

export default function AiAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [agentConfig, setAgentConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [createName, setCreateName] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [agentsRes, configRes] = await Promise.all([
        api.get('/agents'),
        api.get('/ai/agent'),
      ]);

      setAgents(Array.isArray(agentsRes.data) ? agentsRes.data : []);
      setAgentConfig(configRes.data || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load AI agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveCoreAgent = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post('/ai/agent', {
        systemPrompt: agentConfig?.systemPrompt || '',
        active: agentConfig?.isActive ?? agentConfig?.active ?? true,
        intentDetection: agentConfig?.intentDetection ?? false,
        personalizationEnabled: agentConfig?.personalizationEnabled ?? false,
        webSearchEnabled: agentConfig?.webSearchEnabled ?? false,
      });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save AI agent configuration');
    } finally {
      setSaving(false);
    }
  };

  const createAgent = async () => {
    if (!createName.trim()) return;
    setCreating(true);
    setError('');
    try {
      await api.post('/agents', {
        name: createName.trim(),
        description: `${createName.trim()} assistant`,
        isActive: true,
      });
      setCreateName('');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create AI agent');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot className="h-8 w-8 text-violet-600" />
            AI Agents
          </h1>
          <p className="text-gray-500 mt-1">Manage the tenant AI assistant and custom agent records.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          API Connected
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Core AI Assistant</h2>
                <p className="text-sm text-gray-500">This powers the tenant-level AI response behavior.</p>
              </div>
              <Button onClick={saveCoreAgent} disabled={loading || saving} className="rounded-xl">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
            </div>

            {loading || !agentConfig ? (
              <div className="h-48 flex items-center justify-center text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading AI configuration...
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">AI Active</p>
                      <p className="text-xs text-gray-500">Enable AI response handling.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={agentConfig?.isActive ?? agentConfig?.active ?? false}
                      onChange={(e) => setAgentConfig((prev: any) => ({ ...prev, isActive: e.target.checked, active: e.target.checked }))}
                    />
                  </label>
                  <label className="rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">Intent Detection</p>
                      <p className="text-xs text-gray-500">Classify incoming conversations.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={agentConfig?.intentDetection ?? false}
                      onChange={(e) => setAgentConfig((prev: any) => ({ ...prev, intentDetection: e.target.checked }))}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">System Prompt</label>
                  <Textarea
                    value={agentConfig?.systemPrompt || ''}
                    onChange={(e) => setAgentConfig((prev: any) => ({ ...prev, systemPrompt: e.target.value }))}
                    className="min-h-[220px]"
                    placeholder="Define how the assistant should respond."
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-violet-600" />
                Custom Agents
              </h2>
              <p className="text-sm text-gray-500 mt-1">Create lightweight agent records backed by the API.</p>
            </div>

            <div className="flex gap-2">
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Sales Qualifier"
              />
              <Button onClick={createAgent} disabled={creating || !createName.trim()} className="rounded-xl">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>

            {loading ? (
              <div className="h-40 flex items-center justify-center text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading agents...
              </div>
            ) : agents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                No custom agents yet. Create your first one above.
              </div>
            ) : (
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div key={agent.id} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{agent.name || 'Unnamed Agent'}</p>
                        <p className="text-xs text-gray-500 mt-1">{agent.description || 'No description'}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${agent.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
