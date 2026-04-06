'use client';
import { Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function EmailSettingsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Mail className="h-8 w-8 text-red-500" />Email Flow</h1>
        <p className="text-gray-500 mt-1">Configure email automation and SMTP settings.</p>
      </div>
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardContent className="h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Mail className="h-16 w-16 text-gray-200" />
          <p>Email configuration settings coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
