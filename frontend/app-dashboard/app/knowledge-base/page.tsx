'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Database, FileUp, Globe, Loader2, Pencil, Plus, Trash2, Type } from 'lucide-react';
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
  const [ingestingText, setIngestingText] = useState(false);
  const [ingestingUrl, setIngestingUrl] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState('');
  const [textContent, setTextContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.get('/ai/knowledge-bases');
      const nextItems = Array.isArray(response.data) ? response.data : [];
      setItems(nextItems);
      setSelectedKnowledgeBaseId((prev) => prev || nextItems[0]?.id || '');
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
    setSuccess('');
    try {
      const response = await api.post('/ai/knowledge-bases', {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
      setSelectedKnowledgeBaseId(response.data?.id || '');
      setSuccess('Knowledge base created.');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create knowledge base');
    } finally {
      setCreating(false);
    }
  };

  const ingestText = async () => {
    if (!selectedKnowledgeBaseId || !textContent.trim()) return;
    setIngestingText(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/ai/knowledge-bases/ingest', {
        knowledgeBaseId: selectedKnowledgeBaseId,
        content: textContent,
        metadata: { sourceType: 'manual_text' },
      });
      setTextContent('');
      setSuccess(`Added ${response.data?.chunkCount || 0} chunks from text.`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to ingest text');
    } finally {
      setIngestingText(false);
    }
  };

  const ingestUrl = async () => {
    if (!selectedKnowledgeBaseId || !sourceUrl.trim()) return;
    setIngestingUrl(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/ai/knowledge-bases/ingest-url', {
        knowledgeBaseId: selectedKnowledgeBaseId,
        url: sourceUrl.trim(),
      });
      setSourceUrl('');
      setSuccess(`Website imported into ${response.data?.chunkCount || 0} chunks.`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to ingest website');
    } finally {
      setIngestingUrl(false);
    }
  };

  const ingestFile = async () => {
    if (!selectedKnowledgeBaseId || !uploadFile) return;
    setUploadingFile(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('knowledgeBaseId', selectedKnowledgeBaseId);
      formData.append('file', uploadFile);
      const response = await api.post('/ai/knowledge-bases/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadFile(null);
      const input = document.getElementById('knowledge-upload') as HTMLInputElement | null;
      if (input) input.value = '';
      setSuccess(`Uploaded file into ${response.data?.chunkCount || 0} chunks.`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditingName(item.name || '');
    setEditingDescription(item.description || '');
    setError('');
    setSuccess('');
  };

  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return;
    setSavingEdit(true);
    setError('');
    setSuccess('');
    try {
      await api.patch(`/ai/knowledge-bases/${editingId}`, {
        name: editingName.trim(),
        description: editingDescription.trim() || null,
      });
      setSuccess('Knowledge base updated.');
      setEditingId(null);
      setEditingName('');
      setEditingDescription('');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update knowledge base');
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteKnowledgeBase = async (item: any) => {
    if (!window.confirm(`Delete knowledge base "${item.name}" and all of its chunks?`)) return;
    setDeletingId(item.id);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/ai/knowledge-bases/${item.id}`);
      if (selectedKnowledgeBaseId === item.id) {
        setSelectedKnowledgeBaseId('');
      }
      setSuccess('Knowledge base deleted.');
      if (editingId === item.id) {
        setEditingId(null);
        setEditingName('');
        setEditingDescription('');
      }
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete knowledge base');
    } finally {
      setDeletingId(null);
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
      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>
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
                      <div className="flex-1 min-w-0">
                        {editingId === item.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              placeholder="Knowledge base name"
                            />
                            <Textarea
                              value={editingDescription}
                              onChange={(e) => setEditingDescription(e.target.value)}
                              placeholder="Optional description"
                              className="min-h-[100px]"
                            />
                            <div className="flex gap-2">
                              <Button onClick={saveEdit} disabled={savingEdit || !editingName.trim()} className="rounded-xl">
                                {savingEdit ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Pencil className="h-4 w-4 mr-2" />}
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditingName('');
                                  setEditingDescription('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500 mt-1">{item.description || 'No description'}</p>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                          {item.chunkCount ?? 0} chunks
                        </span>
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => startEditing(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-red-600 hover:text-red-700"
                          disabled={deletingId === item.id}
                          onClick={() => void deleteKnowledgeBase(item)}
                        >
                          {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-semibold text-gray-900">Paste Text</h2>
            </div>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
              value={selectedKnowledgeBaseId}
              onChange={(e) => setSelectedKnowledgeBaseId(e.target.value)}
            >
              <option value="">Select knowledge base</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <Textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste support docs, FAQs, SOPs, product notes, or training content."
              className="min-h-[220px]"
            />
            <Button onClick={ingestText} disabled={ingestingText || !selectedKnowledgeBaseId || !textContent.trim()} className="rounded-xl w-full">
              {ingestingText ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Type className="h-4 w-4 mr-2" />}
              Train from text
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Import Website</h2>
            </div>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
              value={selectedKnowledgeBaseId}
              onChange={(e) => setSelectedKnowledgeBaseId(e.target.value)}
            >
              <option value="">Select knowledge base</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <Input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/help/article"
            />
            <p className="text-sm text-gray-500">
              Fetches the page, strips boilerplate HTML, and adds it to the selected knowledge base.
            </p>
            <Button onClick={ingestUrl} disabled={ingestingUrl || !selectedKnowledgeBaseId || !sourceUrl.trim()} className="rounded-xl w-full">
              {ingestingUrl ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Globe className="h-4 w-4 mr-2" />}
              Import website
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <FileUp className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
            </div>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
              value={selectedKnowledgeBaseId}
              onChange={(e) => setSelectedKnowledgeBaseId(e.target.value)}
            >
              <option value="">Select knowledge base</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <input
              id="knowledge-upload"
              type="file"
              className="block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
              accept=".pdf,.txt,.csv,.md,.html,.json,.xml,.xls,.xlsx"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            <p className="text-sm text-gray-500">
              Supported now: PDF, TXT, CSV, Markdown, HTML, JSON, XML, XLS, and XLSX.
            </p>
            <Button onClick={ingestFile} disabled={uploadingFile || !selectedKnowledgeBaseId || !uploadFile} className="rounded-xl w-full">
              {uploadingFile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileUp className="h-4 w-4 mr-2" />}
              Upload document
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
