const fs = require('fs');
const path = require('path');
const { articleToMeiliDocument } = require('./article-content');
const { createPool } = require('./pg-config');

const ARTICLES_DIR = path.join(__dirname, '../../content/articles');
const ARTICLE_SLUG = process.env.ARTICLE_SLUG || process.argv[2] || '';
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://meilisearch:7700';
const MEILISEARCH_MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY || '';

const pool = createPool();

function collectJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...collectJsonFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.json')) result.push(fullPath);
  }

  return result;
}

function articleParams(article) {
  const now = new Date().toISOString();

  return {
    slug: article.slug,
    title: article.title,
    topic: article.topic || '',
    summary: article.summary || '',
    reading_minutes: article.reading_minutes || 5,
    cover_image: article.cover_image || '',
    cover_alt: article.cover_alt || '',
    sections: JSON.stringify(article.sections || []),
    faq: JSON.stringify(article.faq || []),
    tips: JSON.stringify(article.tips || []),
    related_services: JSON.stringify(article.related_services || []),
    related_articles: JSON.stringify(article.related_articles || []),
    related_product_ids: JSON.stringify(article.related_product_ids || []),
    seo_title: article.seo?.title || '',
    seo_description: article.seo?.description || '',
    seo_keywords: JSON.stringify(article.seo?.keywords || []),
    discover: JSON.stringify(article.discover ?? null),
    inline_image: JSON.stringify(article.inline_image ?? article.inlineImage ?? null),
    gantt_chart: JSON.stringify(article.gantt_chart ?? article.ganttChart ?? null),
    variety_table: JSON.stringify(article.variety_table ?? article.varietyTable ?? null),
    status: article.status || 'published',
    published_at: article.published_at || now,
    now,
  };
}

async function fetchMeili(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (MEILISEARCH_MASTER_KEY) {
    headers.Authorization = `Bearer ${MEILISEARCH_MASTER_KEY}`;
  }

  const response = await fetch(`${MEILISEARCH_HOST}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meilisearch error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function syncOneArticle() {
  if (!ARTICLE_SLUG) {
    throw new Error('Missing ARTICLE_SLUG. Example: ARTICLE_SLUG=wierzba-bzygowate-ogrod node src/scripts/sync-one-article-from-file.js');
  }

  const files = collectJsonFiles(ARTICLES_DIR);
  const filePath = files.find((file) => {
    const article = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return article.slug === ARTICLE_SLUG;
  });

  if (!filePath) {
    throw new Error(`Article JSON not found for slug: ${ARTICLE_SLUG}`);
  }

  const article = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const params = articleParams(article);

  console.log(`Updating article from JSON: ${article.slug}`);

  const existing = await pool.query('SELECT id FROM articles WHERE slug = $1::text', [params.slug]);

  if (existing.rows.length === 0) {
    throw new Error(`Article does not exist in database: ${params.slug}. Use IMPORT_NEW_ARTICLES=1 for new articles.`);
  }

  await pool.query(
    `
    UPDATE articles SET
      title = $2::text,
      topic = $3::text,
      summary = $4::text,
      reading_minutes = $5::integer,
      cover_image = $6::text,
      cover_alt = $7::text,
      sections = $8::jsonb,
      faq = $9::jsonb,
      tips = $10::jsonb,
      related_services = $11::jsonb,
      related_articles = $12::jsonb,
      related_product_ids = $13::jsonb,
      seo_title = $14::text,
      seo_description = $15::text,
      seo_keywords = $16::jsonb,
      discover = $17::jsonb,
      inline_image = $18::jsonb,
      gantt_chart = $19::jsonb,
      variety_table = $20::jsonb,
      updated_at = $21::timestamp
    WHERE slug = $1::text
    `,
    [
      params.slug,
      params.title,
      params.topic,
      params.summary,
      params.reading_minutes,
      params.cover_image,
      params.cover_alt,
      params.sections,
      params.faq,
      params.tips,
      params.related_services,
      params.related_articles,
      params.related_product_ids,
      params.seo_title,
      params.seo_description,
      params.seo_keywords,
      params.discover,
      params.inline_image,
      params.gantt_chart,
      params.variety_table,
      params.now,
    ],
  );

  if (process.env.SKIP_MEILI === '1') {
    console.log('Skipping Meilisearch update (SKIP_MEILI=1)');
    return;
  }

  const updated = await pool.query('SELECT * FROM articles WHERE slug = $1::text', [params.slug]);
  await fetchMeili('/indexes/articles/documents', {
    method: 'POST',
    body: JSON.stringify([articleToMeiliDocument(updated.rows[0])]),
  });

  console.log(`Updated article and Meilisearch document: ${params.slug}`);
}

syncOneArticle()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
