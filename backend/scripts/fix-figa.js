const { Pool } = require('pg');
const pool = new Pool({
  host: 'garden-backend-postgres',
  database: 'garden_backend',
  user: 'garden',
  password: 'garden',
});

pool.query(
  `UPDATE articles SET
    cover_image = $1,
    cover_alt = $2,
    inline_image = $3::jsonb
   WHERE slug = $4
   RETURNING slug, cover_image`,
  [
    '/images/articles/figa-z-nasona-cover.webp',
    'Mloda figa wyhodowana z nasona w doniczce — Ficus carica sadzonka z pestki',
    JSON.stringify({
      src: '/images/articles/figa-lisc-nasona-detail.webp',
      alt: 'Lisc figi z bliska — charakterystyczny klapowany lisc Ficus carica'
    }),
    'figa-uprawa-z-nasona'
  ]
).then(r => {
  console.log('OK:', r.rows[0]?.slug, '->', r.rows[0]?.cover_image);
  pool.end();
}).catch(e => {
  console.error('ERR:', e.message);
  pool.end();
});
