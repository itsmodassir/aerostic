'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('Verifying connection...');

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state'); // tenantId

        if (code && state) {
            // Pass the code to the backend to finish the exchange
            api.get(`/meta/callback?code=${code}&state=${state}`)
                .then(() => {
                    setStatus('Success! WhatsApp Connected.');
                    setTimeout(() => {
                        router.push(`/dashboard/${state}/settings/whatsapp`);
                    }, 2000);
                })
                .catch((err) => {
                    console.error('[MetaCallback] Exchange Failed:', err);
                    setStatus('Failed to connect WhatsApp. Please try again from settings.');
                    setTimeout(() => {
                        router.push(`/dashboard/${state}/settings/whatsapp`);
                    }, 3000);
                });
        } else {
            setStatus('Invalid parameters. Returning to dashboard...');
            setTimeout(() => {
                // /dashboard route resolves the first workspace dynamically.
                router.push('/dashboard');
            }, 2000);
        }
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 flex-col gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 font-medium">{status}</p>
        </div>
    );
}

export default function MetaCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackContent />
        </Suspense>
    );
}
