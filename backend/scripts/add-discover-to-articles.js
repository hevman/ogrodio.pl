/**
 * Dodaje blok "discover" do artykułów które go nie mają.
 * Dane discover generowane z istniejących pól: title, summary, cover_image, cover_alt.
 * Polskie znaki zachowane w całości.
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '../content/articles');
const FRESHNESS = '2026-07-04';

function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  const cut = str.lastIndexOf(' ', maxLen);
  return (cut > 0 ? str.slice(0, cut) : str.slice(0, maxLen)).replace(/[,;:\-]+$/, '') + '.';
}

function topicToAngle(topic) {
  if (!topic) return 'praktyczny poradnik ogrodniczy';
  const map = {
    'Pielęgnacja': 'pielęgnacja i uprawa',
    'Owoce w ogrodzie': 'uprawa owoców w ogrodzie',
    'Rośliny domowe i balkonowe': 'rośliny domowe i balkonowe',
    'Choroby i szkodniki': 'choroby i szkodniki roślin',
    'Warzywa': 'uprawa warzyw',
    'Kwiaty': 'uprawa kwiatów',
    'Drzewa i krzewy': 'drzewa i krzewy ozdobne',
    'Zwierzęta w ogrodzie': 'zwierzęta w ogrodzie',
    'Trawnik': 'pielęgnacja trawnika',
    'Narzędzia i urządzenia': 'narzędzia ogrodowe',
  };
  return map[topic] || topic.toLowerCase();
}

function buildDiscover(article) {
  // headline: tytuł z em-dash zastąpionym dwukropkiem, max 110 znaków
  const rawHeadline = article.title.replace(/\s*—\s*/g, ': ');
  const headline = truncate(rawHeadline, 110);

  // description: summary skrócone do 200 znaków
  const description = truncate(article.summary, 200);

  // imageAlt: cover_alt skrócony do 120 znaków
  const imageAlt = truncate(article.cover_alt || article.title, 120);

  return {
    enabled: true,
    headline,
    description,
    image: article.cover_image,
    imageAlt,
    angle: topicToAngle(article.topic),
    freshness: FRESHNESS,
  };
}

// Zbiera pliki JSON rekurencyjnie
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
let updated = 0;
let skipped = 0;

for (const filePath of files) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const article = JSON.parse(raw);

  const discover = buildDiscover(article);

  // Rekonstruuj obiekt z zachowaniem kolejności kluczy.
  // Stary klucz discover pomijamy — wstawiamy nowo wygenerowany zaraz po cover_alt.
  const keys = Object.keys(article).filter(k => k !== 'discover');
  const insertAfter = keys.includes('cover_alt') ? 'cover_alt' : 'cover_image';
  const insertIdx = keys.indexOf(insertAfter) + 1;

  const newArticle = {};
  for (let i = 0; i < keys.length; i++) {
    if (i === insertIdx) {
      newArticle.discover = discover;
    }
    newArticle[keys[i]] = article[keys[i]];
  }
  // Edge case: insertIdx >= keys.length
  if (!newArticle.discover) {
    newArticle.discover = discover;
  }

  fs.writeFileSync(filePath, JSON.stringify(newArticle, null, 2) + '\n', 'utf8');
  updated++;
  console.log(`[UPDATED] ${file}`);
}

console.log(`\nGotowe: ${updated} zaktualizowanych, ${skipped} pominiętych.`);
