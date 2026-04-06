'use client';
import { Workflow, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function WhatsAppFlowsPage() {
  const router = useRouter();
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wa-forms').then(r => setFlows(r.data || [])).catch(() => toast.error('Failed to load flows')).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Workflow className="h-8 w-8 text-blue-500" />WhatsApp Flows</h1>
          <p className="text-gray-500 mt-1">Build interactive message flows for your customers.</p>
        </div>
        <Button className="rounded-xl" onClick={() => router.push('/settings/whatsapp/forms')}><Plus className="h-4 w-4 mr-2" />New Flow</Button>
      </div>
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardContent className="p-6">
          {loading ? <div className="h-48 flex items-center justify-center text-gray-400">Loading flows...</div>
          : flows.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Workflow className="h-16 w-16 text-gray-200" />
              <p>No flows created yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flows.map((f: any) => (
                <div key={f.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
                  <h3 className="font-semibold">{f.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{f.status}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
