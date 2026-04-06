'use client';
import { useEffect, useState } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasOpenAiKey, setHasOpenAiKey] = useState(false);

  useEffect(() => {
    api
      .get('/admin/system/config')
      .then(({ data }) => {
        setHasGeminiKey(Boolean(data?.['ai.gemini_api_key']?.value));
        setHasOpenAiKey(Boolean(data?.['ai.openai_api_key']?.value));
      })
      .catch(() => {
        toast.error('AI settings are available to super admins only');
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      const updates: Record<string, string> = {};
      if (geminiKey) updates['ai.gemini_api_key'] = geminiKey;
      if (openaiKey) updates['ai.openai_api_key'] = openaiKey;

      if (Object.keys(updates).length === 0) {
        toast.error('Enter at least one API key to save');
        return;
      }

      await api.post('/admin/system/config', updates);
      setGeminiKey('');
      setOpenaiKey('');
      setHasGeminiKey(hasGeminiKey || Boolean(updates['ai.gemini_api_key']));
      setHasOpenAiKey(hasOpenAiKey || Boolean(updates['ai.openai_api_key']));
      toast.success('AI settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader><CardTitle>API Keys</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Google Gemini API Key</label>
            <Input
              type="password"
              placeholder={loading ? 'Loading...' : hasGeminiKey ? 'Configured. Enter a new key to rotate it.' : 'AIza...'}
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">OpenAI API Key</label>
            <Input
              type="password"
              placeholder={loading ? 'Loading...' : hasOpenAiKey ? 'Configured. Enter a new key to rotate it.' : 'sk-...'}
              value={openaiKey}
              onChange={e => setOpenaiKey(e.target.value)}
              className="font-mono"
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
