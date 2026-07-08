/**
 * Synchronizuje pole variety_table z plików JSON do bazy danych.
 */
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

(async () => {
  const files = collectJsonFiles(ARTICLES_DIR);
  let updated = 0;
  let skipped = 0;

  for (const filePath of files) {
    const article = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const vt = article.varietyTable ?? article.variety_table ?? null;

    const result = await pool.query(
      `UPDATE articles
       SET variety_table = $1
       WHERE slug = $2
         AND variety_table IS DISTINCT FROM $1
       RETURNING slug`,
      [JSON.stringify(vt ?? {}), article.slug]
    );

    if (result.rows.length > 0) {
      updated++;
      console.log('Zaktualizowano variety_table:', article.slug);
    } else {
      skipped++;
    }
  }

  console.log(`Gotowe. Zaktualizowano: ${updated}, bez zmian: ${skipped}.`);
  await pool.end();
})().catch(e => {
  console.error('Blad:', e.message);
  process.exit(1);
});
