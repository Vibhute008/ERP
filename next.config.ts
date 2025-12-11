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
    // Disable image optimization to avoid issues with hosting
    unoptimized: true,
  },
  // Enable Turbopack optimizations
  turbopack: {},
};

export default nextConfig;