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
        const state = searchParams.get('state'); // tenantId:mode
        const wabaId = searchParams.get('wabaId');
        const phoneNumberId = searchParams.get('phoneNumberId');
        const tenantIdFromState = state?.split(':')[0] || '';
        const persistTenantContext = (tenantId: string) => {
            localStorage.setItem('x-tenant-id', tenantId);
            document.cookie = `selected_tenant=${tenantId}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
        };

        if (code && state) {
            // Dynamically determine the redirect URI used in the initial request
            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://app.aimstore.in';
            const redirectUri = `${currentOrigin}/meta/callback`;
            
            // Pass the code and extracted FB assets to the backend
            let apiUrl = `/meta/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&redirectUri=${encodeURIComponent(redirectUri)}`;
            if (wabaId) apiUrl += `&wabaId=${encodeURIComponent(wabaId)}`;
            if (phoneNumberId) apiUrl += `&phoneNumberId=${encodeURIComponent(phoneNumberId)}`;

            api.get(apiUrl)
                .then(() => {
                    setStatus('Success! WhatsApp Connected.');
                    setTimeout(() => {
                        if (tenantIdFromState) {
                            persistTenantContext(tenantIdFromState);
                        }
                        router.push('/settings/whatsapp');
                    }, 2000);
                })
                .catch((err) => {
                    console.error('[MetaCallback] Exchange Failed:', err);
                    setStatus('Failed to connect WhatsApp. Please try again from settings.');
                    setTimeout(() => {
                        if (tenantIdFromState) {
                            persistTenantContext(tenantIdFromState);
                        }
                        router.push('/settings/whatsapp');
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
