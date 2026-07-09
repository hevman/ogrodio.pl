import type { MetadataRoute } from "next";
import { getAdviceArticles } from "@/lib/advice";
import { plantCatalog } from "@/lib/plant-catalog";
import { articleCategories, getArticlePath, site } from "@/lib/site-config";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAdviceArticles();
  const base = site.publicUrl;

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/porady`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/katalog-roslin`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/ogrodio-plant-intelligence`, changeFrequency: "monthly", priority: 0.88 },
    { url: `${base}/o-nas`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryPages = articleCategories.map((category) => ({
    url: `${base}/porady/${category.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const articlePages = articles.map((article) => ({
    url: `${base}${getArticlePath(article)}`,
    lastModified: article.updatedAt || undefined,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const plantPages = plantCatalog.map((plant) => ({
    url: `${base}/katalog-roslin/${plant.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  return [...staticPages, ...categoryPages, ...articlePages, ...plantPages];
}
