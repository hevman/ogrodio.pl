const fs = require('fs');
const path = require('path');
const { articleToMeiliDocument } = require('./article-content');
const { createPool } = require('./pg-config');

const ARTICLES_DIR = path.join(__dirname, '../../content/articles');

const pool = createPool();

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://meilisearch:7700';
const MEILISEARCH_MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY || '';

async function fetchMeili(endpoint, options = {}) {
  const url = `${MEILISEARCH_HOST}${endpoint}`;
  const headers = { 'Content-Type': 'application/json' };

  if (MEILISEARCH_MASTER_KEY) {
    headers.Authorization = `Bearer ${MEILISEARCH_MASTER_KEY}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meilisearch error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

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

async function syncArticlesFromFiles() {
  try {
    console.log('Szukam artykulow w:', ARTICLES_DIR);

    if (!fs.existsSync(ARTICLES_DIR)) {
      console.log('Katalog artykulow nie istnieje:', ARTICLES_DIR);
      return;
    }

    const files = collectJsonFiles(ARTICLES_DIR);
    console.log(`Znaleziono ${files.length} plikow artykulow`);
    const sourceSlugs = files.map((filePath) => {
      const article = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (!article.slug) throw new Error(`Brak slug w pliku: ${filePath}`);
      return article.slug;
    });

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const article = JSON.parse(content);

      console.log(`\nPrzetwarzam: ${article.slug}`);

      try {
        const existing = await pool.query(
          'SELECT id FROM articles WHERE slug = $1::text',
          [article.slug],
        );

        const params = articleParams(article);

        if (existing.rows.length > 0) {
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

          updated++;
          console.log(`  Zaktualizowano: ${article.title}`);
        } else {
          await pool.query(
            `
            INSERT INTO articles (
              slug, title, topic, summary, reading_minutes, cover_image, cover_alt,
              sections, faq, tips, related_services, related_articles, related_product_ids,
              seo_title, seo_description, seo_keywords, discover, status, published_at, inline_image,
              gantt_chart, variety_table, created_at, updated_at
            ) VALUES (
              $1::text, $2::text, $3::text, $4::text, $5::integer, $6::text, $7::text,
              $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, $13::jsonb,
              $14::text, $15::text, $16::jsonb, $17::jsonb, $18::text, $19::timestamp, $20::jsonb,
              $21::jsonb, $22::jsonb, $23::timestamp, $24::timestamp
            )
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
              params.status,
              params.published_at,
              params.inline_image,
              params.gantt_chart,
              params.variety_table,
              params.now,
              params.now,
            ],
          );

          created++;
          console.log(`  Utworzono: ${article.title}`);
        }
      } catch (error) {
        failed++;
        console.error(`  Blad przy artykule "${article.slug}":`, error.message);
      }
    }

    const deleted = await pool.query(
      `DELETE FROM articles WHERE NOT (slug = ANY($1::text[]))`,
      [sourceSlugs],
    );

    console.log(
      `\nSynchronizacja zakonczona. Utworzono: ${created}, zaktualizowano: ${updated}, usunieto: ${deleted.rowCount ?? 0}, bledy: ${failed}`,
    );

    if (failed > 0) {
      throw new Error(`Nie udalo sie zsynchronizowac ${failed} artykulow`);
    }

    if (process.env.SKIP_MEILI === '1') {
      console.log('Pomijam indeksowanie Meilisearch (SKIP_MEILI=1)');
      return;
    }

    console.log('\nIndeksuje artykuly w Meilisearch...');
    const result = await pool.query(
      "SELECT * FROM articles WHERE status = 'published'",
    );
    const documents = result.rows.map((article) => articleToMeiliDocument(article));

    await fetchMeili('/indexes/articles/documents', {
      method: 'POST',
      body: JSON.stringify(documents),
    });

    console.log(`Zindeksowano ${documents.length} artykulow w Meilisearch`);
  } catch (error) {
    console.error('Blad podczas synchronizacji:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

syncArticlesFromFiles();
