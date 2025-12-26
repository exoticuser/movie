import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true, // For better compatibility with static exports if needed
  },
  // Enable standalone output for Vercel deployment
  output: 'standalone',
};

export default nextConfig;
