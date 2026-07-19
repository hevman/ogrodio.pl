import type { MetadataRoute } from "next";
import { getPlantCatalog } from "@/lib/plant-catalog";
import { site } from "@/lib/site-config";

export async function getPlantSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const base = site.publicUrl;
  const plantCatalog = await getPlantCatalog();

  return plantCatalog.map((plant) => ({
    url: `${base}/katalog-roslin/${plant.slug}`,
    changeFrequency: "monthly",
    priority: 0.72,
  }));
}
