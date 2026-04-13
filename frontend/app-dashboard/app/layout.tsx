import './globals.css';
import type { Metadata } from 'next';

export const viewport: { themeColor: string; width: string; initialScale: number } = {
    themeColor: '#3B82F6',
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    metadataBase: new URL('https://aimstore.in'),
    title: 'Aimstors Solution - WhatsApp Marketing & Automation Platform',
    description: 'India\'s #1 WhatsApp Marketing Platform. Send bulk campaigns, deploy AI chatbots, automate customer support, and grow your business with Aimstors Solution.',
    keywords: 'whatsapp marketing, whatsapp api, whatsapp automation, bulk whatsapp, whatsapp crm, whatsapp chatbot, india',
    authors: [{ name: 'Aimstors Solution' }],
    creator: 'Aimstors Solution',
    publisher: 'Aimstors Solution',
    robots: 'index, follow',
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://aimstore.in',
        siteName: 'Aimstors Solution',
        title: 'Aimstors Solution - WhatsApp Marketing & Automation Platform',
        description: 'Turn WhatsApp into your sales machine with AI-powered automation. Join 2,500+ businesses.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Aimstors Solution - WhatsApp Marketing Platform',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Aimstors Solution - WhatsApp Marketing Platform',
        description: 'AI-powered WhatsApp marketing for growing businesses',
        images: ['/og-image.png'],
    },
    manifest: '/manifest.json',
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                var RETRY_KEY = 'last_chunk_reload';
                                var SUCCESS_KEY = 'last_chunk_success';

                                function getNow() {
                                    return Date.now();
                                }

                                function getLastRetry() {
                                    return Number(localStorage.getItem(RETRY_KEY) || '0');
                                }

                                function buildRetryUrl() {
                                    var url = new URL(window.location.href);
                                    url.searchParams.set('__chunk_retry', String(getNow()));
                                    return url.toString();
                                }

                                function recoverFromChunkError() {
                                    var now = getNow();
                                    var lastRetry = getLastRetry();

                                    // Avoid infinite reload loops while still forcing a fresh HTML request
                                    if (lastRetry && (now - lastRetry) < 30000) {
                                        return;
                                    }

                                    localStorage.setItem(RETRY_KEY, String(now));
                                    sessionStorage.removeItem('auth_redirect_at');

                                    try {
                                        if ('caches' in window) {
                                            caches.keys().then(function(keys) {
                                                return Promise.all(keys.map(function(key) {
                                                    return caches.delete(key);
                                                }));
                                            }).catch(function() {});
                                        }
                                    } catch (err) {}

                                    console.warn('Next.js chunk mismatch detected. Requesting a fresh build.');
                                    window.location.replace(buildRetryUrl());
                                }

                                var successAt = Number(localStorage.getItem(SUCCESS_KEY) || '0');
                                if (!successAt || (getNow() - successAt) > 10000) {
                                    localStorage.setItem(SUCCESS_KEY, String(getNow()));
                                    localStorage.removeItem(RETRY_KEY);
                                }
                                
                                // Global error listener for ChunkLoadError (Next.js/Webpack)
                                window.addEventListener('error', function(e) {
                                    var chunkError = e.message && (
                                        e.message.indexOf('Loading chunk') !== -1 || 
                                        e.message.indexOf('ChunkLoadError') !== -1 ||
                                        e.message.indexOf('Failed to fetch dynamically imported module') !== -1
                                    );
                                    
                                    if (chunkError) {
                                        recoverFromChunkError();
                                    }
                                }, true);

                                // Also handle unhandled promise rejections (often used for dynamic imports)
                                window.addEventListener('unhandledrejection', function(e) {
                                    var reason = e.reason && e.reason.toString();
                                    if (reason && (
                                        reason.indexOf('ChunkLoadError') !== -1 ||
                                        reason.indexOf('Loading chunk') !== -1 ||
                                        reason.indexOf('Failed to fetch dynamically imported module') !== -1
                                    )) {
                                        recoverFromChunkError();
                                    }
                                });
                            })();
                        `
                    }}
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js').then(
                                        function(registration) {
                                            console.log('PWA ServiceWorker registration successful with scope: ', registration.scope);
                                        },
                                        function(err) {
                                            console.log('PWA ServiceWorker registration failed: ', err);
                                        }
                                    );
                                });
                            }
                        `
                    }}
                />
            </head>
            <body className="font-sans antialiased">
                {children}
            </body>
        </html>
    );
}
