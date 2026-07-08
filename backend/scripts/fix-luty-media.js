const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'garden-backend-postgres',
  database: process.env.DB_NAME || 'garden_backend',
  user: process.env.DB_USER || 'garden',
  password: process.env.DB_PASSWORD || 'garden',
});

async function run() {
  const res = await pool.query(
    `UPDATE articles
     SET cover_image = $1,
         cover_alt   = $2,
         inline_image = $3::jsonb
     WHERE slug = 'co-siejemy-w-lutym'
     RETURNING slug, cover_image`,
    [
      '/images/articles/rozsadnik-wypelniony-luty-detail.webp',
      'Kaseta rozsadnikowa wypełniona ziemią z opisanymi etykietkami — gotowa do siewu pierwszych nasion w lutym',
      JSON.stringify({
        src: '/images/articles/rozsadnik-kaseta-luty-cover.webp',
        alt: 'Pusta plastikowa kaseta rozsadnikowa przygotowana do pierwszych siewów sezonu — tacka do rozsady z kwadratowymi komórkami'
      })
    ]
  );
  console.log('Zaktualizowano:', res.rows[0]);
  await pool.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
