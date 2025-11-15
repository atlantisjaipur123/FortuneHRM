/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@vercel/analytics'],
    optimizeCss: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  compress: true,

  // ✅ Add this new section for backend proxy
  async rewrites() {
    return [
      {
        source: "/api/:path*",              // frontend request path
        destination: "http://localhost:5000/api/:path*", // backend server
      },
    ];
  },
};

export default nextConfig;
