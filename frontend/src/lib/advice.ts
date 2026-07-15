import type { AdviceArticle, AdviceDiscoverMeta } from "@/lib/advice-types";
import { site } from "@/lib/site-config";

export type { AdviceArticle, AdviceDiscoverMeta, AdviceSection, AdviceSeo } from "@/lib/advice-types";

/**
 * URL backendu.
 * - Server-side (SSR): używa BACKEND_URL = http://backend:3000 (Docker internal)
 * - Client-side: pusty string → ścieżka względna przez nginx
 */
function backendUrl(): string {
  if (typeof window === "undefined") {
    return process.env.BACKEND_URL || site.publicUrl;
  }
  return "";
}

function transformArticle(article: any): AdviceArticle {
  return {
    slug: article.slug,
    title: article.title,
    topic: article.topic,
    summary: article.summary,
    readingMinutes: article.readingMinutes ?? article.reading_minutes ?? 5,
    updatedAt: article.updatedAt ?? article.updated_at ?? "",
    createdAt: article.createdAt ?? article.created_at ?? article.updatedAt ?? article.updated_at ?? "",
    coverImage: article.coverImage ?? article.cover_image ?? "",
    coverAlt: article.coverAlt ?? article.cover_alt ?? "",
    discover: article.discover ?? undefined,
    sections: (article.sections || []).map((s: any) => ({
      heading: s.heading || "",
      paragraphs: s.paragraphs || [],
    })),
    faq: article.faq || [],
    tips: Array.isArray(article.tips)
      ? article.tips.map((t: any) => (typeof t === "string" ? t : t?.tip ?? ""))
      : [],
    relatedArticles: article.relatedArticles ?? article.related_articles ?? [],
    seo: article.seo || {
      title: article.seo_title || "",
      description: article.seo_description || "",
      keywords: article.seo_keywords || [],
    },
    inlineImage: article.inlineImage ?? article.inline_image ?? undefined,
    ganttChart: article.ganttChart ?? article.gantt_chart ?? undefined,
    varietyTable: article.varietyTable ?? article.variety_table ?? undefined,
  };
}

export function getAdviceDiscoverMeta(article: AdviceArticle): AdviceDiscoverMeta {
  const discover = article.discover ?? {};
  if (discover.enabled === false) {
    return {
      description: article.seo.description || article.summary,
      enabled: false,
      headline: article.seo.title || article.title,
      image: article.coverImage,
      imageAlt: article.coverAlt,
      updatedAt: article.updatedAt,
    };
  }

  return {
    angle: discover.angle,
    description: discover.description || article.seo.description || article.summary,
    enabled: discover.enabled ?? true,
    headline: discover.headline || article.seo.title || article.title,
    image: discover.image || article.coverImage,
    imageAlt: discover.imageAlt || article.coverAlt,
    updatedAt: discover.freshness || article.updatedAt,
  };
}

export async function getAdviceArticles(): Promise<AdviceArticle[]> {
  try {
    const res = await fetch(`${backendUrl()}/api/articles`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map(transformArticle);
  } catch (err) {
    console.warn("Failed to load advice articles:", err);
    return [];
  }
}

export async function getAdviceArticle(slug: string): Promise<AdviceArticle | null> {
  try {
    const res = await fetch(`${backendUrl()}/api/articles/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return transformArticle(await res.json());
  } catch (err) {
    console.warn(`Failed to load advice article "${slug}":`, err);
    return null;
  }
}

export async function getFeaturedAdvice(count = 3): Promise<AdviceArticle[]> {
  const articles = await getAdviceArticles();
  return articles.slice(0, count);
}

/** Wyszukiwanie przez Meilisearch (przez backend proxy) */
export async function searchAdviceArticles(
  query: string,
  topic?: string,
): Promise<{ hits: AdviceArticle[] }> {
  try {
    const qs = new URLSearchParams({ q: query });
    if (topic) qs.set("topic", topic);
    const res = await fetch(`${backendUrl()}/api/articles/search?${qs}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const hits = Array.isArray(data?.hits) ? data.hits : Array.isArray(data) ? data : [];
    return { hits: hits.map(transformArticle) };
  } catch (err) {
    console.warn("Failed to search articles:", err);
    return { hits: [] };
  }
}

export async function getAdviceArticlesByTopic(topic: string): Promise<AdviceArticle[]> {
  try {
    const res = await fetch(`${backendUrl()}/api/articles/topic/${encodeURIComponent(topic)}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map(transformArticle);
  } catch (err) {
    console.warn(`Failed to load articles for topic "${topic}":`, err);
    return [];
  }
}


