'use client';

import { useEffect, useState } from 'react';
import { Loader2, Mail, Plus, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

const emptyForm = {
  name: '',
  emailAddress: '',
  provider: 'custom_smtp',
  host: '',
  port: '587',
  user: '',
  pass: '',
};

export default function EmailSettingsPage() {
  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/mailboxes');
      setMailboxes(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load mailboxes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveMailbox = async () => {
    if (!form.name.trim() || !form.emailAddress.trim() || !form.host.trim() || !form.user.trim() || !form.pass.trim()) {
      setError('Please fill mailbox name, sender email, SMTP host, SMTP user, and SMTP password.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/mailboxes', {
        name: form.name.trim(),
        emailAddress: form.emailAddress.trim(),
        provider: form.provider,
        isActive: true,
        smtpConfig: {
          host: form.host.trim(),
          port: Number(form.port) || 587,
          secure: Number(form.port) === 465,
          auth: {
            user: form.user.trim(),
            pass: form.pass,
          },
        },
      });
      setForm(emptyForm);
      setSuccess('Mailbox saved successfully.');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save mailbox');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/email/test-connection', {
        host: form.host.trim(),
        port: Number(form.port) || 587,
        secure: Number(form.port) === 465,
        user: form.user.trim(),
        pass: form.pass,
        fromEmail: form.emailAddress.trim() || form.user.trim(),
      });
      setSuccess(response.data?.message || 'SMTP connection successful.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'SMTP connection failed');
    } finally {
      setTesting(false);
    }
  };

  const removeMailbox = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      await api.delete(`/mailboxes/${id}`);
      setSuccess('Mailbox removed.');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove mailbox');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Add Mailbox</h2>
            <Input placeholder="Mailbox label" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Sender email" value={form.emailAddress} onChange={(e) => setForm({ ...form, emailAddress: e.target.value })} />
            <Input placeholder="SMTP host" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="SMTP port" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} />
              <Input placeholder="SMTP user" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} />
            </div>
            <Input type="password" placeholder="SMTP password" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} />
            <div className="flex flex-wrap gap-3">
              <Button onClick={saveMailbox} disabled={saving} className="rounded-xl">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Save Mailbox
              </Button>
              <Button onClick={testConnection} disabled={testing} variant="outline" className="rounded-xl">
                {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Test SMTP
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Configured Mailboxes</h2>
              <span className="text-sm text-gray-500">{mailboxes.length} total</span>
            </div>

            {loading ? (
              <div className="h-48 flex items-center justify-center text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading mailboxes...
              </div>
            ) : mailboxes.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center gap-3 text-gray-400">
                <Mail className="h-16 w-16 text-gray-200" />
                <p>No mailboxes configured yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mailboxes.map((mailbox) => (
                  <div key={mailbox.id} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{mailbox.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{mailbox.emailAddress}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {mailbox.smtpConfig?.host || 'No SMTP host'}:{mailbox.smtpConfig?.port || '-'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => removeMailbox(mailbox.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
