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
                                var lastReload = localStorage.getItem('last_chunk_reload');
                                var now = Date.now();
                                
                                // Global error listener for ChunkLoadError (Next.js/Webpack)
                                window.addEventListener('error', function(e) {
                                    var chunkError = e.message && (
                                        e.message.indexOf('Loading chunk') !== -1 || 
                                        e.message.indexOf('ChunkLoadError') !== -1 ||
                                        e.message.indexOf('Failed to fetch dynamically imported module') !== -1
                                    );
                                    
                                    if (chunkError) {
                                        // Avoid infinite reload loops (max once per 30 seconds)
                                        if (!lastReload || (now - parseInt(lastReload)) > 30000) {
                                            localStorage.setItem('last_chunk_reload', now.toString());
                                            console.warn('Next.js ChunkLoadError detected. Accessing new build... Reloading.');
                                            window.location.reload(true);
                                        }
                                    }
                                }, true);

                                // Also handle unhandled promise rejections (often used for dynamic imports)
                                window.addEventListener('unhandledrejection', function(e) {
                                    var reason = e.reason && e.reason.toString();
                                    if (reason && (reason.indexOf('ChunkLoadError') !== -1 || reason.indexOf('Loading chunk') !== -1)) {
                                        if (!lastReload || (now - parseInt(lastReload)) > 30000) {
                                            localStorage.setItem('last_chunk_reload', now.toString());
                                            window.location.reload(true);
                                        }
                                    }
                                });
                            })();
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
