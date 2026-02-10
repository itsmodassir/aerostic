'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
        _fbInitialized?: boolean;
    }
}

interface FacebookSDKLoaderProps {
    appId: string;
}

export default function FacebookSDKLoader({ appId }: FacebookSDKLoaderProps) {
    useEffect(() => {
        if (window.FB && window._fbInitialized) {
            console.log('[MetaSDK] SDK already initialized');
            return;
        }

        const cleanAppId = appId?.trim();
        console.log('[MetaSDK] Initializing SDK with AppId:', cleanAppId);

        window.fbAsyncInit = function () {
            if (window.FB) {
                window.FB.init({
                    appId: cleanAppId,
                    autoLogAppEvents: true,
                    cookie: true,
                    xfbml: true,
                    version: 'v21.0'
                });
                window._fbInitialized = true;
                console.log('[MetaSDK] FB.init complete');
            }
        };

        if (window.FB && !window._fbInitialized) {
            window.fbAsyncInit();
        }
    }, [appId]);

    return (
        <Script
            id="facebook-jssdk"
            src="https://connect.facebook.net/en_US/sdk.js"
            strategy="afterInteractive"
        />
    );
}

export function launchWhatsAppSignup(
    configId: string,
    state: string,
    callback: (code: string) => void
) {
    console.log('[MetaSDK] launchWhatsAppSignup called', { configId, state });

    if (!window.FB) {
        alert('Facebook SDK not loaded yet');
        return;
    }

    window.FB.getLoginStatus(() => {
        console.log('[MetaSDK] Calling FB.login now...');

        window.FB.login(
            (response: any) => {
                if (response?.authResponse?.code) {
                    callback(response.authResponse.code);
                } else {
                    console.warn('[MetaSDK] Signup cancelled or failed', response);
                }
            },
            {
                config_id: configId,
                response_type: 'code',
                override_default_response_type: true,

                // 🚨 REQUIRED
                redirect_uri: 'https://app.aerostic.com/meta/callback',

                extras: {
                    version: 'v3',
                    state
                }
            }
        );
    });
}
