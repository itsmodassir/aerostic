/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    transpilePackages: ['lucide-react'],
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },
    turbopack: {
        root: process.cwd(),
    },
    async rewrites() {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
        ];
    }
};

export default nextConfig;
