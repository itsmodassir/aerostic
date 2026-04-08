'use client';
import { useEffect, useState } from 'react';
import { Bot, CheckCircle2, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AiSettingsPage() {
  const [agent, setAgent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ai/agent')
      .then((agentRes) => {
        setAgent(agentRes.data);
      })
      .catch(() => {
        toast.error('Failed to load AI settings');
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      if (!agent) {
        toast.error('AI settings are still loading');
        return;
      }

      await api.post('/ai/agent', {
        systemPrompt: agent.systemPrompt || '',
        active: agent.isActive ?? agent.active ?? true,
        intentDetection: agent.intentDetection ?? false,
        personalizationEnabled: agent.personalizationEnabled ?? false,
        webSearchEnabled: agent.webSearchEnabled ?? false,
      });
      toast.success('AI assistant settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader><CardTitle>AI Provider Status</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading provider status...
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Bot className="h-4 w-4 text-violet-600" />
                    Gemini
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Managed globally from the admin panel
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Platform AI
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Workspace prompt and behavior controls live here
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                Provider keys are managed from the admin panel. This page controls how your workspace AI behaves.
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader><CardTitle>Workspace AI Assistant</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">AI replies enabled</p>
                <p className="text-xs text-gray-500">Allow automatic replies for this workspace.</p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(agent?.isActive ?? agent?.active)}
                onChange={(e) => setAgent((prev: any) => ({ ...prev, isActive: e.target.checked, active: e.target.checked }))}
                disabled={loading}
              />
            </label>
            <label className="rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Intent detection</p>
                <p className="text-xs text-gray-500">Classify sales/support intents automatically.</p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(agent?.intentDetection)}
                onChange={(e) => setAgent((prev: any) => ({ ...prev, intentDetection: e.target.checked }))}
                disabled={loading}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Personalized tone</p>
                <p className="text-xs text-gray-500">Adapt wording with a warmer conversational style.</p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(agent?.personalizationEnabled)}
                onChange={(e) => setAgent((prev: any) => ({ ...prev, personalizationEnabled: e.target.checked }))}
                disabled={loading}
              />
            </label>
            <label className="rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Web grounding</p>
                <p className="text-xs text-gray-500">Let Gemini use web retrieval when available.</p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(agent?.webSearchEnabled)}
                onChange={(e) => setAgent((prev: any) => ({ ...prev, webSearchEnabled: e.target.checked }))}
                disabled={loading}
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">System Prompt</label>
            <Textarea
              value={agent?.systemPrompt || ''}
              onChange={(e) => setAgent((prev: any) => ({ ...prev, systemPrompt: e.target.value }))}
              className="min-h-[220px]"
              placeholder="Define how the AI should answer customers."
              disabled={loading}
            />
          </div>

          <Button onClick={save} disabled={saving || loading} className="w-full rounded-xl mt-4">
            <Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
