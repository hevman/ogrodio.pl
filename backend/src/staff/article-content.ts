function parseJsonField<T>(value: unknown): T | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }
  return value as T;
}

export function normalizeArticleForIndexing(article: any) {
  const seoKeywords =
    parseJsonField<string[]>(article.seo_keywords) ??
    article.seo?.keywords ??
    [];

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    topic: article.topic,
    summary: article.summary,
    reading_minutes: article.reading_minutes ?? article.readingMinutes,
    cover_image: article.cover_image ?? article.coverImage,
    cover_alt: article.cover_alt ?? article.coverAlt,
    seo_title: article.seo_title ?? article.seo?.title,
    seo_description: article.seo_description ?? article.seo?.description,
    seo_keywords: seoKeywords,
    status: article.status,
    updated_at: article.updated_at ?? article.updatedAt,
    sections: parseJsonField<any[]>(article.sections) ?? [],
    faq: parseJsonField<any[]>(article.faq) ?? [],
    tips: parseJsonField<any[]>(article.tips) ?? [],
    varietyTable:
      parseJsonField<any>(article.variety_table ?? article.varietyTable) ?? null,
    ganttChart: parseJsonField<any>(article.gantt_chart ?? article.ganttChart) ?? null,
    seo: { keywords: seoKeywords },
  };
}

/** Tekst artykułu do wyszukiwarki i SEO (sections, FAQ, tabele, wykres). */
export function buildArticleSearchContent(article: any): string {
  const sections = article.sections || [];
  const sectionText = sections
    .map((section: any) => [section.heading, ...(section.paragraphs || [])].filter(Boolean).join("\n"))
    .join("\n\n");

  const faqText = (article.faq || [])
    .map((item: any) => `${item.question || ""}\n${item.answer || ""}`)
    .join("\n\n");

  const table = article.varietyTable ?? article.variety_table;
  const tableText = table?.rows
    ? table.rows
        .map((row: any) =>
          [row.name, row.group, row.harvest, row.fruitSize, row.taste, row.yield, row.notes]
            .filter(Boolean)
            .join(" "),
        )
        .join("\n")
    : "";

  const gantt = article.ganttChart ?? article.gantt_chart;
  const ganttText = gantt?.rows
    ? gantt.rows.map((row: any) => `${row.name} ${row.group}`).join("\n")
    : "";

  const tips = article.tips || [];
  const tipsText = tips
    .map((tip: any) => (typeof tip === "string" ? tip : tip?.tip ?? ""))
    .filter(Boolean)
    .join("\n");

  const keywords = article.seo?.keywords ?? article.seo_keywords ?? [];

  return [
    article.summary,
    sectionText,
    faqText,
    table?.caption,
    table?.tableIntro,
    tableText,
    gantt?.title,
    gantt?.subtitle,
    ganttText,
    tipsText,
    Array.isArray(keywords) ? keywords.join(", ") : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function articleToMeiliDocument(article: any) {
  const normalized = normalizeArticleForIndexing(article);
  return {
    id: normalized.id,
    slug: normalized.slug,
    title: normalized.title,
    topic: normalized.topic,
    summary: normalized.summary,
    content: buildArticleSearchContent(normalized),
    reading_minutes: normalized.reading_minutes,
    cover_image: normalized.cover_image,
    cover_alt: normalized.cover_alt,
    seo_title: normalized.seo_title,
    seo_description: normalized.seo_description,
    seo_keywords: normalized.seo_keywords,
    status: normalized.status,
    updated_at: normalized.updated_at,
  };
}
