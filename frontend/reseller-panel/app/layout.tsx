import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

export const viewport: { themeColor: string; width: string; initialScale: number } = {
    themeColor: '#3B82F6',
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    title: 'Partner Console - Aerostic Enterprise',
    description: 'Elite Distributor Hub for Aerostic Global. Manage client ecosystems, monitor commissions, and synchronize white-label identity protocols.',
    robots: 'noindex, nofollow',
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
            <body className={`${inter.className} font-sans antialiased`}>
                {children}
            </body>
        </html>
    );
}
