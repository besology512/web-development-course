/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        const backendUrl = process.env.BACKEND_URL || 'http://backend:5000';
        const storageUrl = process.env.STORAGE_URL || 'http://minio:9000';
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`
            },
            {
                source: '/storage/:path*',
                destination: `${storageUrl}/:path*`
            }
        ];
    }
};

module.exports = nextConfig;
