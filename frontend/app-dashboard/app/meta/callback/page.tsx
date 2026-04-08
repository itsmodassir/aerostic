'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { persistWorkspaceMemberships, setActiveWorkspaceContext } from '@/lib/workspace-context';

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('Verifying connection...');

    const extractMessage = (err: any) => {
        const details = err?.response?.data?.details;
        const detailMessage =
            typeof details === 'string'
                ? details
                : Array.isArray(details?.message)
                    ? details.message.join(', ')
                    : details?.message;

        return (
            err?.response?.data?.message ||
            detailMessage ||
            err?.message ||
            'Failed to connect WhatsApp. Please try again from settings.'
        );
    };

    useEffect(() => {
        const syncTenantContext = async (tenantId: string) => {
            setActiveWorkspaceContext({ id: tenantId });

            try {
                const workspacesRes = await api.get('/auth/workspaces');
                const workspaces = Array.isArray(workspacesRes.data) ? workspacesRes.data : [];
                persistWorkspaceMemberships(workspaces);
                const matchingWorkspace = workspaces.find((workspace: any) =>
                    workspace?.tenantId === tenantId ||
                    workspace?.id === tenantId ||
                    workspace?.tenant?.id === tenantId
                );
                const workspaceSlug = matchingWorkspace?.tenant?.slug || matchingWorkspace?.slug;

                if (workspaceSlug) {
                    setActiveWorkspaceContext({ id: tenantId, slug: workspaceSlug });
                }
            } catch (error) {
                console.warn('[MetaCallback] Failed to resolve workspace slug after callback', error);
            }
        };

        const run = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state'); // tenantId:mode
            const wabaId = searchParams.get('wabaId');
            const phoneNumberId = searchParams.get('phoneNumberId');
            const tenantIdFromState = state?.split(':')[0] || '';

            if (!code || !state) {
                setStatus('Invalid callback parameters. Returning to WhatsApp settings...');
                window.setTimeout(() => {
                    router.replace('/settings/whatsapp?error=invalid_callback');
                }, 1500);
                return;
            }

            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://app.aimstore.in';
            const redirectUri = `${currentOrigin}/meta/callback`;

            let apiUrl = `/meta/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&redirectUri=${encodeURIComponent(redirectUri)}`;
            if (wabaId) apiUrl += `&wabaId=${encodeURIComponent(wabaId)}`;
            if (phoneNumberId) apiUrl += `&phoneNumberId=${encodeURIComponent(phoneNumberId)}`;

            try {
                await api.get(apiUrl);
                if (tenantIdFromState) {
                    await syncTenantContext(tenantIdFromState);
                }
                
                // Notify parent window and close popup
                if (window.opener) {
                    window.opener.postMessage({ type: 'WA_CONNECTED', success: true }, window.location.origin);
                    setStatus('Success! Closing window...');
                    setTimeout(() => window.close(), 1000);
                } else {
                    setStatus('Success! WhatsApp connected. Redirecting...');
                    router.replace('/settings/whatsapp?connected=1');
                }
            } catch (err: any) {
                console.error('[MetaCallback] Exchange Failed:', err);
                const message = extractMessage(err);
                setStatus(message);
                
                if (tenantIdFromState) {
                    await syncTenantContext(tenantIdFromState);
                }

                // Notify parent window of error
                if (window.opener) {
                    window.opener.postMessage({ type: 'WA_CONNECTED', success: false, error: message }, window.location.origin);
                    setTimeout(() => window.close(), 2000);
                } else {
                    router.replace(`/settings/whatsapp?error=${encodeURIComponent(message)}`);
                }
            }
        };

        void run();
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
