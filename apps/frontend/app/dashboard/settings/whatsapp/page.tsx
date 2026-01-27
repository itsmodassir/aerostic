'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function WhatsappSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);

    useEffect(() => {
        // Decode token to get tenantId (In logic app, use Context)
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                setTenantId(payload.tenantId);
            } catch (e) {
                console.error('Invalid token');
            }
        }
    }, []);

    const handleConnect = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            // 1. Get the Facebook Redirect URL from backend
            // Note: The backend returns a 302, but axios follows it. 
            // Better to get the URL string or just navigate window.location

            // Actually, our backend controller does `res.redirect`. 
            // So we should just window.location.href to the backend endpoint.
            window.location.href = `http://localhost:3001/whatsapp/embedded/start?tenantId=${tenantId}`;

        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">WhatsApp Configuration</h2>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Connection Status</h3>

                <div className="flex items-center space-x-4 mb-6">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">Not Connected</span>
                </div>

                <div className="p-4 bg-blue-50 text-blue-800 rounded-md mb-6 text-sm">
                    Connect your Facebook Business Account to enable WhatsApp Messaging.
                    You will be redirected to Facebook to approve permissions.
                </div>

                <button
                    onClick={handleConnect}
                    disabled={!tenantId || loading}
                    className="flex items-center justify-center space-x-2 w-full py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold rounded-lg transition-all"
                >
                    {/* Facebook Icon */}
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Login with Facebook</span>
                </button>
            </div>
        </div>
    );
}
