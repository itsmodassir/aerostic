'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
    }
}

interface FacebookSDKLoaderProps {
    appId: string;
}

export default function FacebookSDKLoader({ appId }: FacebookSDKLoaderProps) {
    useEffect(() => {
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: appId,
                autoLogAppEvents: true,
                cookie: true,
                xfbml: true,
                version: 'v22.0'
            });
        };
    }, [appId]);

    return (
        <Script
            async
            defer
            crossOrigin="anonymous"
            src="https://connect.facebook.net/en_US/sdk.js"
            strategy="afterInteractive"
        />
    );
}

export function launchWhatsAppSignup(configId: string, callback: (code: string) => void) {
    if (!window.FB) {
        console.error('Facebook SDK not loaded');
        return;
    }

    window.FB.login(
        (response: any) => {
            if (response.authResponse) {
                const code = response.authResponse.code;
                callback(code);
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        },
        {
            config_id: configId,
            response_type: 'code',
            override_default_response_type: true,
            extras: { version: 'v3' }
        }
    );
}
