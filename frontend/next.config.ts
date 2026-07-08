import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Tylko WebP — AVIF jest zbyt kosztowny na 2 vCPU VPS
    formats: ["image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1400, 1920],
    imageSizes: [64, 112, 208, 256, 384],
    // Zoptymalizowane obrazy cache'owane 31 dni (źródła i tak są wersjonowane nazwą pliku)
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  async rewrites() {
    return [];
  }
};

export default nextConfig;
