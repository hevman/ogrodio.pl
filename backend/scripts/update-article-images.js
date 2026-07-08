const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'garden-backend-postgres',
  database: process.env.DB_NAME || 'garden_backend',
  user: process.env.DB_USER || 'garden',
  password: process.env.DB_PASSWORD || 'garden',
});

async function update() {
  const updates = [
    {
      slug: 'kiedy-zakladac-trawnik',
      cover_image: '/images/articles/trawnik-zakladanie-cover.webp',
      cover_alt: 'Zakładanie trawnika w ogrodzie — przygotowanie gruntu pod trawnik z rolki lub siewu',
      inline_image: {
        src: '/images/articles/trawnik-zakladanie-detail.webp',
        alt: 'Trawnik z bliska — zielona trawa w ogrodzie przydomowym'
      }
    },
    {
      slug: 'figa-uprawa-z-nasona',
      cover_image: '/images/articles/figa-z-nasona-cover.webp',
      cover_alt: 'Młoda figa wyhodowana z nasona w szarej doniczce — Ficus carica sadzonka z pestki na drewnianych schodach',
      inline_image: {
        src: '/images/articles/figa-lisc-nasona-detail.webp',
        alt: 'Liść figi z bliska — charakterystyczny głęboko klapowany liść figowca pospolitego Ficus carica'
      }
    },
      cover_image: '/images/articles/kaktusy-kompozycja-detail.webp',
      cover_alt: 'Kaktusy i hawortia w kompozycji z góry — dwa kaktusy kolumnowe i sukulentna hawortia w dekoracyjnej misce z żwirkiem',
      inline_image: {
        src: '/images/articles/kaktusy-kompozycja-cover.webp',
        alt: 'Kompozycja kaktusów i sukulentów z nawozem Agrecol do kaktusów — jak nawozić kaktusy w domu'
      }
    }
  ];

  for (const u of updates) {
    const res = await pool.query(
      `UPDATE articles SET cover_image=$1, cover_alt=$2, inline_image=$3::jsonb WHERE slug=$4 RETURNING slug, cover_image`,
      [u.cover_image, u.cover_alt, JSON.stringify(u.inline_image), u.slug]
    );
    if (res.rows.length > 0) {
      console.log('Updated:', res.rows[0].slug, '->', res.rows[0].cover_image);
    } else {
      console.log('Not found:', u.slug);
    }
  }
  await pool.end();
}

update().catch(e => { console.error(e.message); process.exit(1); });
