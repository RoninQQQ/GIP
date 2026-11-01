import type { NextConfig } from "next";

const isPreview = process.env.NEXT_PUBLIC_APP_MODE === 'preview';

const nextConfig: NextConfig = {
  ...(isPreview ? { output: 'export' } : {}),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['better-sqlite3'],
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  devIndicators: false,
};

export default nextConfig;
