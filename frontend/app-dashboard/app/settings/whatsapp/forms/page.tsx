'use client';
import { Workflow, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function WaFormsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Workflow className="h-8 w-8 text-green-500" />WA Forms</h1>
          <p className="text-gray-500 mt-1">Create and manage WhatsApp interactive forms.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/settings/whatsapp/flows" className="w-full sm:w-auto"><Button variant="outline" className="rounded-xl w-full sm:w-auto justify-center"><ExternalLink className="h-4 w-4 mr-2" />Flow Builder</Button></Link>
          <Button className="rounded-xl w-full sm:w-auto justify-center"><Plus className="h-4 w-4 mr-2" />New Form</Button>
        </div>
      </div>
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardContent className="h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Workflow className="h-16 w-16 text-gray-200" />
          <p>No forms created yet. Create your first WhatsApp form to capture leads.</p>
        </CardContent>
      </Card>
    </div>
  );
}
