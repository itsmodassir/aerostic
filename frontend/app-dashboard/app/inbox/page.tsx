'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resolveActiveWorkspaceSlug } from '@/lib/server-workspace.client';

export default function InboxPage() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const slug = await resolveActiveWorkspaceSlug();
        router.replace(`/dashboard/${slug}/inbox`);
      } catch (err) {
        router.replace('/dashboard');
      }
    };
    handleRedirect();
  }, [router]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-50 rounded-[40px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Redirecting to Workspace...</p>
    </div>
  );
}
