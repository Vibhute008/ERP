import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Enable performance optimizations
  experimental: {
    optimizeCss: true,
  },
  // Enable compression
  compress: true,
  // Enable image optimization
  images: {
    minimumCacheTTL: 60,
    // Since we're using local images, we don't need to configure remote domains
  },
  // Enable Turbopack optimizations
  turbopack: {},
};

export default nextConfig;