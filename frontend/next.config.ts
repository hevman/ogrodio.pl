import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Tylko WebP — AVIF jest zbyt kosztowny na 2 vCPU VPS
    formats: ["image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1400, 1920],
    imageSizes: [64, 112, 208, 256, 384, 720, 900],
    // Zoptymalizowane obrazy cache'owane 31 dni (źródła i tak są wersjonowane nazwą pliku)
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "sklep.ogrodio.pl",
        pathname: "/assets/**",
      },
      {
        protocol: "http",
        hostname: "sklep.ogrodio.localhost",
        pathname: "/assets/**",
      },
    ]
  },
  async rewrites() {
    return [];
  }
};

export default nextConfig;
