import type { MetadataRoute } from "next";
import { getAdviceSitemapEntries } from "@/lib/seo/sitemap-advice";
import { getPlantSitemapEntries } from "@/lib/seo/sitemap-plants";
import { getShopSitemapEntries } from "@/lib/seo/sitemap-shop";
import { getStaticSitemapEntries } from "@/lib/seo/sitemap-static";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [advicePages, shopPages] = await Promise.all([
    getAdviceSitemapEntries(),
    getShopSitemapEntries(),
  ]);

  return [
    ...getStaticSitemapEntries(),
    ...advicePages,
    ...getPlantSitemapEntries(),
    ...shopPages,
  ];
}
