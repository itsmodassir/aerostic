'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Database, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/ai/knowledge-bases');
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load knowledge bases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createKnowledgeBase = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError('');
    try {
      await api.post('/ai/knowledge-bases', {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create knowledge base');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-indigo-600" />
          Knowledge Base
        </h1>
        <p className="text-gray-500 mt-1">Create tenant knowledge bases for AI grounding and document ingestion.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Create Knowledge Base</h2>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Support Docs" />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="min-h-[120px]"
            />
            <Button onClick={createKnowledgeBase} disabled={creating || !name.trim()} className="rounded-xl">
              {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Create
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Available Knowledge Bases</h2>
              <span className="text-sm text-gray-500">{items.length} total</span>
            </div>

            {loading ? (
              <div className="h-48 flex items-center justify-center text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading knowledge bases...
              </div>
            ) : items.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center gap-3 text-gray-400">
                <Database className="h-16 w-16 text-gray-200" />
                <p>No knowledge bases yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.description || 'No description'}</p>
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        {item.chunkCount ?? 0} chunks
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
