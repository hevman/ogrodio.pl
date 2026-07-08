function parseJsonField(value) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function normalizeArticleForIndexing(article) {
  const seoKeywords =
    parseJsonField(article.seo_keywords) ?? article.seo?.keywords ?? [];

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
    sections: parseJsonField(article.sections) ?? [],
    faq: parseJsonField(article.faq) ?? [],
    tips: parseJsonField(article.tips) ?? [],
    varietyTable:
      parseJsonField(article.variety_table ?? article.varietyTable) ?? null,
    ganttChart:
      parseJsonField(article.gantt_chart ?? article.ganttChart) ?? null,
    seo: { keywords: seoKeywords },
  };
}

function buildArticleSearchContent(article) {
  const normalized = normalizeArticleForIndexing(article);
  const sections = normalized.sections || [];
  const sectionText = sections
    .map((section) =>
      [section.heading, ...(section.paragraphs || [])].filter(Boolean).join('\n'),
    )
    .join('\n\n');

  const faqText = (normalized.faq || [])
    .map((item) => `${item.question || ''}\n${item.answer || ''}`)
    .join('\n\n');

  const table = normalized.varietyTable;
  const tableText = table?.rows
    ? table.rows
        .map((row) =>
          [row.name, row.group, row.harvest, row.fruitSize, row.taste, row.yield, row.notes]
            .filter(Boolean)
            .join(' '),
        )
        .join('\n')
    : '';

  const gantt = normalized.ganttChart;
  const ganttText = gantt?.rows
    ? gantt.rows.map((row) => `${row.name} ${row.group}`).join('\n')
    : '';

  const tipsText = (normalized.tips || [])
    .map((tip) => (typeof tip === 'string' ? tip : tip?.tip ?? ''))
    .filter(Boolean)
    .join('\n');

  const keywords = normalized.seo?.keywords ?? normalized.seo_keywords ?? [];

  return [
    normalized.summary,
    sectionText,
    faqText,
    table?.caption,
    table?.tableIntro,
    tableText,
    gantt?.title,
    gantt?.subtitle,
    ganttText,
    tipsText,
    Array.isArray(keywords) ? keywords.join(', ') : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function articleToMeiliDocument(article) {
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

module.exports = {
  buildArticleSearchContent,
  articleToMeiliDocument,
};
