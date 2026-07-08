const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const ARTICLES_DIR = path.join(__dirname, '../../content/articles');

const pool = new Pool({
  host: process.env.DB_HOST || 'garden-backend-postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'garden_backend',
  user: process.env.DB_USER || 'garden',
  password: process.env.DB_PASSWORD || 'garden',
});

async function importArticlesFromFiles() {
  try {
    console.log('Szukam artykulow w:', ARTICLES_DIR);

    if (!fs.existsSync(ARTICLES_DIR)) {
      console.log('Katalog artykulow nie istnieje:', ARTICLES_DIR);
      return;
    }

    const collectJsonFiles = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const result = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) result.push(...collectJsonFiles(fullPath));
        else if (entry.isFile() && entry.name.endsWith('.json')) result.push(fullPath);
      }
      return result;
    };

    const files = collectJsonFiles(ARTICLES_DIR);

    console.log(`Znaleziono ${files.length} plikow artykulow`);

    let created = 0;
    let skipped = 0;

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const article = JSON.parse(content);

      console.log(`\nPrzetwarzam: ${article.slug}`);

      try {
        const existing = await pool.query(
          'SELECT id FROM articles WHERE slug = $1::text',
          [article.slug],
        );

        if (existing.rows.length > 0) {
          console.log(`  Pomijam istniejacy artykul: ${article.slug}`);
          skipped++;
          continue;
        }

        const now = new Date().toISOString();
        const params = [
          article.slug,
          article.title,
          article.topic || '',
          article.summary || '',
          article.reading_minutes || 5,
          article.cover_image || '',
          article.cover_alt || '',
          JSON.stringify(article.sections || []),
          JSON.stringify(article.faq || []),
          JSON.stringify(article.tips || []),
          JSON.stringify(article.related_services || []),
          JSON.stringify(article.related_articles || []),
          JSON.stringify(article.related_product_ids || []),
          article.seo?.title || '',
          article.seo?.description || '',
          JSON.stringify(article.seo?.keywords || []),
          JSON.stringify(article.discover ?? null),
          article.status || 'published',
          article.published_at || now,
          JSON.stringify(article.inline_image ?? article.inlineImage ?? null),
          JSON.stringify(article.gantt_chart ?? article.ganttChart ?? null),
          JSON.stringify(article.variety_table ?? article.varietyTable ?? null),
          now,
          now,
        ];

        console.log('  Tworze nowy artykul');

        await pool.query(`
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
        `, params);

        created++;
        console.log(`  Sukces: ${article.title}`);
      } catch (error) {
        console.error(`  Blad przy artykule "${article.slug}":`, error.message);
      }
    }

    console.log(`\nImport zakonczony. Utworzono: ${created}, pominieto: ${skipped}`);
  } catch (error) {
    console.error('Blad podczas importu:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importArticlesFromFiles();
