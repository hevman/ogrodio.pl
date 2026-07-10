import type { MetadataRoute } from "next";
import { fetchProducts } from "@/lib/shop-api";
import { site } from "@/lib/site-config";
import { shopIndexingEnabled } from "@/lib/seo/shop-indexing";

export async function getShopSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  if (!shopIndexingEnabled) return [];

  try {
    const products = await fetchProducts();
    const base = site.publicUrl;
    const uniqueProductSlugs = Array.from(new Set(products.map((product) => product.slug)));

    return [
      { url: `${base}/sklep`, changeFrequency: "daily", priority: 0.8 },
      ...uniqueProductSlugs.map((slug) => ({
        url: `${base}/produkt/${slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.65,
      })),
    ];
  } catch (error) {
    console.warn("Failed to load shop sitemap entries:", error);
    return [];
  }
}
