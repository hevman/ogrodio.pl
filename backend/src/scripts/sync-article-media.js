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

async function syncArticleMedia() {
  try {
    if (!fs.existsSync(ARTICLES_DIR)) {
      console.log('Article directory does not exist:', ARTICLES_DIR);
      return;
    }

    const files = fs.readdirSync(ARTICLES_DIR).filter((file) => file.endsWith('.json'));
    let updated = 0;
    let skipped = 0;
    let missing = 0;

    for (const file of files) {
      const article = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8'));
      const inlineImage = article.inline_image ?? article.inlineImage ?? null;

      const result = await pool.query(
        `
          UPDATE articles
          SET cover_image = $1::text,
              inline_image = $2::jsonb
          WHERE slug = $3::text
            AND (
              cover_image IS DISTINCT FROM $1::text
              OR inline_image IS DISTINCT FROM $2::jsonb
            )
          RETURNING slug
        `,
        [
          article.cover_image || '',
          JSON.stringify(inlineImage),
          article.slug,
        ],
      );

      if (result.rows.length > 0) {
        updated++;
        console.log(`Updated media: ${article.slug}`);
        continue;
      }

      const existing = await pool.query('SELECT id FROM articles WHERE slug = $1::text', [article.slug]);
      if (existing.rows.length === 0) {
        missing++;
        console.log(`Missing in database: ${article.slug}`);
      } else {
        skipped++;
      }
    }

    console.log(`Article media sync done. Updated: ${updated}, unchanged: ${skipped}, missing: ${missing}.`);
  } catch (error) {
    console.error('Article media sync failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

syncArticleMedia();
