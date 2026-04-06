'use client';
import { useState, useEffect } from 'react';
import { Gift, Copy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ReferralsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/referrals').then(r => setData(r.data)).catch(() => {});
  }, []);

  const copy = () => {
    const code = data?.referralCode || '';
    if (code) {
        navigator.clipboard.writeText(code);
        toast.success('Referral code copied!');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Gift className="h-8 w-8 text-pink-500" />Referrals</h1>
        <p className="text-gray-500 mt-1">Earn rewards by referring new customers.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader><CardTitle>Your Referral Code</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <code className="text-2xl font-bold tracking-widest flex-1">{data?.referralCode || '—'}</code>
              <Button variant="outline" size="icon" onClick={copy}><Copy className="h-4 w-4" /></Button>
            </div>
            <p className="text-sm text-gray-500">Share this code with friends. Earn credits when they subscribe.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Stats</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between"><span className="text-gray-500">Total Referrals</span><span className="font-bold">{data?.totalReferrals || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Converted</span><span className="font-bold text-green-600">{data?.converted || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Credits Earned</span><span className="font-bold text-purple-600">{data?.creditsEarned || 0}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
