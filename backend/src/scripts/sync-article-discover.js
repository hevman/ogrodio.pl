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

async function syncArticleDiscover() {
  try {
    if (!fs.existsSync(ARTICLES_DIR)) {
      console.log('Katalog artykulow nie istnieje:', ARTICLES_DIR);
      return;
    }

    // Zbiera pliki JSON rekurencyjnie z podfolderów (calendar, sowing, guides itd.)
    const collectJsonFiles = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const result = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          result.push(...collectJsonFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          result.push(fullPath);
        }
      }
      return result;
    };

    const files = collectJsonFiles(ARTICLES_DIR);
    let updated = 0;
    let skipped = 0;

    for (const filePath of files) {
      const article = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      if (!article.slug || article.discover === undefined) {
        skipped++;
        continue;
      }

      const result = await pool.query(
        `UPDATE articles
         SET discover = $1::jsonb, updated_at = updated_at
         WHERE slug = $2::text
         RETURNING slug`,
        [JSON.stringify(article.discover), article.slug],
      );

      if (result.rowCount > 0) {
        updated++;
        console.log(`Zaktualizowano discover: ${article.slug}`);
      } else {
        skipped++;
        console.log(`Pominieto, brak w bazie: ${article.slug}`);
      }
    }

    console.log(`Synchronizacja discover zakonczona. Zaktualizowano: ${updated}, pominieto: ${skipped}`);
  } finally {
    await pool.end();
  }
}

syncArticleDiscover().catch((error) => {
  console.error('Blad synchronizacji discover:', error.message);
  process.exit(1);
});
