const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '../content/articles/sowing');

const M = '[Marchew](/porady/warzywnik/marchew-uprawa-siew-zbiory)';
const B = '[Burak ćwikłowy](/porady/warzywnik/burak-uprawa-i-pielegnacja)';
const BS = '[Buraki ćwikłowe](/porady/warzywnik/burak-uprawa-i-pielegnacja)';
const S = '[Sałata liściowa](/porady/warzywnik/salata-lisciowa-uprawa-zbiory)';
const SJ = '[Sałata jesienna](/porady/warzywnik/salata-lisciowa-uprawa-zbiory)';
const SZ = '[Sałata zimująca](/porady/warzywnik/salata-lisciowa-uprawa-zbiory)';
const R = '[Rzodkiewka](/porady/warzywnik/rzodkiewka-siew-kiedy-i-jak)';
const BL = '[burak liściowy](/porady/warzywnik/burak-uprawa-i-pielegnacja)';

const patches = {
  'co-siejemy-w-marcu.json': [
    ['"Marchew — od końca marca', `"${M} — od końca marca`],
    ['"Rzodkiewka — od połowy marca', `"${R} — od połowy marca`],
    ['"Sałata — odporna', `"${S} — odporna`],
  ],
  'co-siejemy-w-maju.json': [
    ['"Marchew — siej od początku maja', `"${M} — siej od początku maja`],
    ['"Buraki ćwikłowe — od połowy kwietnia', `"${BS} — od połowy kwietnia`],
    ['"Sałata i szpinak — siej', `"${S} i szpinak — siej`],
    ['"Rzodkiewka — przez cały maj', `"${R} — przez cały maj`],
  ],
  'co-siejemy-w-czerwcu.json': [
    ['"Sałata i mieszanki sałatowe — siej', `"${S} i mieszanki sałatowe — siej`],
    ['"Rzodkiewka — siej co 1', `"${R} — siej co 1`],
    ['"Boćwina i burak liściowy — siew', `"Boćwina i ${BL} — siew`],
  ],
  'co-siejemy-w-lipcu.json': [
    ['"Sałata i mieszanki sałatowe — siej co 2', `"${S} i mieszanki sałatowe — siej co 2`],
    ['"Rzodkiewka — najszybsze', `"${R} — najszybsze`],
    ['"Marchew — tylko wczesne', `"${M} — tylko wczesne`],
  ],
  'co-siejemy-w-sierpniu.json': [
    ['"Sałata jesienna — siej', `"${SJ} — siej`],
    ['"Rzodkiewka — siej do końca sierpnia', `"${R} — siej do końca sierpnia`],
  ],
  'co-siejemy-we-wrzesniu.json': [
    ['"Sałata zimująca — siej', `"${SZ} — siej`],
  ],
};

const relatedPatches = {
  'co-siejemy-w-marcu.json': ['jak-zalozyc-warzywnik-w-ogrodzie', 'marchew-uprawa-siew-zbiory'],
  'co-siejemy-w-maju.json': ['jak-zalozyc-warzywnik-w-ogrodzie', 'marchew-uprawa-siew-zbiory', 'rzodkiewka-siew-kiedy-i-jak'],
  'co-siejemy-w-czerwcu.json': ['salata-lisciowa-uprawa-zbiory', 'rzodkiewka-siew-kiedy-i-jak'],
  'co-siejemy-w-lipcu.json': ['salata-lisciowa-uprawa-zbiory', 'rzodkiewka-siew-kiedy-i-jak'],
};

for (const [file, reps] of Object.entries(patches)) {
  const fp = path.join(DIR, file);
  let content = fs.readFileSync(fp, 'utf8');
  for (const [from, to] of reps) {
    if (!content.includes(from)) {
      console.warn('MISSING:', file, from.slice(0, 40));
      continue;
    }
    content = content.replace(from, to);
  }
  fs.writeFileSync(fp, content);
  console.log('Patched', file);
}

for (const [file, addSlugs] of Object.entries(relatedPatches)) {
  const fp = path.join(DIR, file);
  const article = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const existing = new Set(article.related_articles || []);
  for (const slug of addSlugs) existing.add(slug);
  article.related_articles = [...existing];
  fs.writeFileSync(fp, JSON.stringify(article, null, 2) + '\n');
  console.log('Related', file);
}
