import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Tylko WebP — AVIF jest zbyt kosztowny na 2 vCPU VPS
    formats: ["image/webp"],
    // deviceSizes: duże monitory 1440p/4K — hero full-width; inline do ~1340px kolumny artykułu
    deviceSizes: [360, 640, 828, 1080, 1400, 1920, 2560],
    imageSizes: [64, 112, 208, 256, 384, 720, 900, 1200, 1400],
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
