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
        if (!cleanAppId) {
            console.warn('[MetaSDK] No AppID provided to FacebookSDKLoader');
            return;
        }

        console.log('[MetaSDK] Initializing SDK with AppId:', cleanAppId);

        window.fbAsyncInit = function () {
            if (window.FB) {
                window.FB.init({
                    appId: cleanAppId,
                    autoLogAppEvents: true,
                    cookie: true,
                    xfbml: true,
                    version: 'v22.0'
                });
                window._fbInitialized = true;
                console.log('[MetaSDK] FB.init complete');
            }
        };

        // If the script is already loaded but fbAsyncInit hasn't run
        if (window.FB && !window._fbInitialized) {
            window.fbAsyncInit();
        }
    }, [appId]);

    return (
        <Script
            id="facebook-jssdk"
            src="https://connect.facebook.net/en_US/sdk.js"
            strategy="afterInteractive"
            onLoad={() => {
                console.log('[MetaSDK] Facebook Script loaded');
                if (window.fbAsyncInit) window.fbAsyncInit();
            }}
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
        console.error('[MetaSDK] Facebook SDK not loaded yet');
        alert('Facebook SDK is still loading. Please wait a moment and try again.');
        return;
    }

    // Determine redirect URI based on environment
    const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI ||
        (typeof window !== 'undefined' && window.location.origin ?
            `${window.location.origin}/meta/callback` :
            'https://app.aerostic.com/meta/callback');

    try {
        window.FB.login(
            (response: any) => {
                if (response?.authResponse?.code) {
                    console.log('[MetaSDK] Got auth code');
                    callback(response.authResponse.code);
                } else {
                    console.warn('[MetaSDK] Signup cancelled or failed', response);
                }
            },
            {
                config_id: configId,
                response_type: 'code',
                override_default_response_type: true,
                redirect_uri: redirectUri,
                extras: {
                    version: 'v3',
                    session_info: {
                        version: 'v3'
                    },
                    setup: {
                        // Optional: can add more setup params here if needed
                    },
                    state
                }
            }
        );
    } catch (error) {
        console.error('[MetaSDK] Error launching signup:', error);
        alert('Failed to launch Facebook login. Please check if popups are blocked.');
    }
}
