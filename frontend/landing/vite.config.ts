import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        react(),
        /*
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'Aerostic AI - AI Chat Assistant',
                short_name: 'Aerostic AI',
                description: 'AI chatbot and chat assistant for content creation.',
                theme_color: '#7c3aed',
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: '/lovable-uploads/e47c9b5a-4447-4b53-9d63-ce43b0477e62.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/lovable-uploads/e47c9b5a-4447-4b53-9d63-ce43b0477e62.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
            }
        })
        */
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                },
            },
        },
    },
});
