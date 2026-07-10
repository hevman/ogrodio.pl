import type { MetadataRoute } from "next";
import { site } from "@/lib/site-config";

export function getStaticSitemapEntries(): MetadataRoute.Sitemap {
  const base = site.publicUrl;

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/porady`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/katalog-roslin`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/ogrodio-plant-intelligence`, changeFrequency: "monthly", priority: 0.88 },
    { url: `${base}/o-nas`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
