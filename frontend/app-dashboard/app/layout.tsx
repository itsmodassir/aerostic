import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Aerostic - WhatsApp Marketing & Automation Platform',
    description: 'India\'s #1 WhatsApp Marketing Platform. Send bulk campaigns, deploy AI chatbots, automate customer support, and grow your business with Aerostic.',
    keywords: 'whatsapp marketing, whatsapp api, whatsapp automation, bulk whatsapp, whatsapp crm, whatsapp chatbot, india',
    authors: [{ name: 'Aerostic' }],
    creator: 'Aerostic',
    publisher: 'Aerostic',
    robots: 'index, follow',
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://aimstore.in',
        siteName: 'Aerostic',
        title: 'Aerostic - WhatsApp Marketing & Automation Platform',
        description: 'Turn WhatsApp into your sales machine with AI-powered automation. Join 2,500+ businesses.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Aerostic - WhatsApp Marketing Platform',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Aerostic - WhatsApp Marketing Platform',
        description: 'AI-powered WhatsApp marketing for growing businesses',
        images: ['/og-image.png'],
    },
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#3B82F6',
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
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body className="font-sans antialiased">
                {children}
            </body>
        </html>
    );
}
