import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.tabi.mn/api/:path*',
      },
    ];
  },
};

export default nextConfig;
