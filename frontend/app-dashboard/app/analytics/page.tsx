'use client';

import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, MessageSquare, Target, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/summary').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Messages Sent', value: stats?.totalMessages || 0, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Delivered', value: stats?.delivered || 0, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Contacts Reached', value: stats?.uniqueContacts || 0, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Campaigns Run', value: stats?.campaigns || 0, icon: Target, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><BarChart2 className="h-8 w-8 text-blue-500" />Analytics</h1>
          <p className="text-gray-500 mt-1">Track your messaging performance and campaign metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(c => (
          <Card key={c.label} className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 ${c.bg} rounded-xl`}><c.icon className={`h-6 w-6 ${c.color}`} /></div>
              <div><p className="text-sm text-gray-500">{c.label}</p><p className="text-2xl font-bold">{loading ? '...' : c.value.toLocaleString()}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl shadow-sm border-gray-100">
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Activity Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400 flex-col gap-3">
            <BarChart2 className="h-16 w-16 text-gray-200" />
            <p className="text-sm">Analytics charts coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
