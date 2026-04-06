'use client';
import { useState } from 'react';
import { Bot, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AiSettingsPage() {
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      if (geminiKey) await api.post('/admin/config', { key: 'ai.gemini_api_key', value: geminiKey });
      if (openaiKey) await api.post('/admin/config', { key: 'ai.openai_api_key', value: openaiKey });
      toast.success('AI settings saved');
    } catch { toast.error('Failed to save settings'); } finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Bot className="h-8 w-8 text-purple-500" />AI Models</h1>
        <p className="text-gray-500 mt-1">Configure your AI provider API keys.</p>
      </div>
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader><CardTitle>API Keys</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Google Gemini API Key</label>
            <Input type="password" placeholder="AIza..." value={geminiKey} onChange={e => setGeminiKey(e.target.value)} className="font-mono" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">OpenAI API Key</label>
            <Input type="password" placeholder="sk-..." value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} className="font-mono" />
          </div>
          <Button onClick={save} disabled={saving} className="w-full rounded-xl mt-4">
            <Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
