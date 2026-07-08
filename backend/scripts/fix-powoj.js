const { Pool } = require('pg');
const p = new Pool({ host: 'garden-backend-postgres', database: 'garden_backend', user: 'garden', password: 'garden' });
const img = JSON.stringify({ src: '/images/articles/powoj-polny-kwiat-cover.webp', alt: 'Powoj polny z bialym kwiatem i pszczola na kwiecie' });
p.query(
  'UPDATE articles SET cover_image=$1, cover_alt=$2, inline_image=$3::jsonb WHERE slug=$4 RETURNING slug',
  ['/images/articles/powoj-polny-chwast-detail.webp', 'Powoj polny wijacy sie przez kamienie na murze', img, 'powoj-polny-jak-sie-pozbyc']
).then(r => { console.log('OK:', r.rows[0]?.slug); p.end(); }).catch(e => { console.error(e.message); p.end(); });
