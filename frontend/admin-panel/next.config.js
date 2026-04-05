/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['lucide-react'],
    // Admin Subdomain Protocol
    async rewrites() {
        return [];
    }
};

export default nextConfig;
