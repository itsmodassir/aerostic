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
                        router.push('/dashboard/settings/whatsapp');
                    }, 2000);
                })
                .catch((err) => {
                    console.error(err);
                    setStatus('Failed to connect. Please try again.');
                });
        } else {
            setStatus('Invalid callback parameters.');
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
