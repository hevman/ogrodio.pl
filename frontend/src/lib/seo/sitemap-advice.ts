import type { MetadataRoute } from "next";
import { getAdviceArticles } from "@/lib/advice";
import { articleCategories, getArticlePath, site } from "@/lib/site-config";

export async function getAdviceSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAdviceArticles();
  const base = site.publicUrl;

  const categoryPages: MetadataRoute.Sitemap = articleCategories.map((category) => ({
    url: `${base}/porady/${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${base}${getArticlePath(article)}`,
    lastModified: article.updatedAt || undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...categoryPages, ...articlePages];
}
