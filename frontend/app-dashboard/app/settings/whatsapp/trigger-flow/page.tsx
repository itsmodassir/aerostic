'use client';
import { Zap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function TriggerFlowPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Zap className="h-8 w-8 text-yellow-500" />Trigger Flow</h1>
          <p className="text-gray-500 mt-1">Set up keyword triggers and auto-reply flows.</p>
        </div>
        <Button className="rounded-xl"><Plus className="h-4 w-4 mr-2" />New Trigger</Button>
      </div>
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardContent className="h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Zap className="h-16 w-16 text-gray-200" />
          <p>No triggers configured. Add keyword triggers to automate replies.</p>
        </CardContent>
      </Card>
    </div>
  );
}
