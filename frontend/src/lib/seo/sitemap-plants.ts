import type { MetadataRoute } from "next";
import { plantCatalog } from "@/lib/plant-catalog";
import { site } from "@/lib/site-config";

export function getPlantSitemapEntries(): MetadataRoute.Sitemap {
  const base = site.publicUrl;

  return plantCatalog.map((plant) => ({
    url: `${base}/katalog-roslin/${plant.slug}`,
    changeFrequency: "monthly",
    priority: 0.72,
  }));
}
